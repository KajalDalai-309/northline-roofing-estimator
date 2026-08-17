/**
 * Pricing Calculation Engine for Northline Roofing & Exteriors
 * 
 * Formula Definition:
 * 1. Base Material Cost = roof_area * rate_per_sqft * (1 + waste_factor)
 * 2. Tear-Off Cost = roof_area * tear_off_per_sqft
 * 3. Adjusted Subtotal = (Base Material Cost + Tear-Off Cost) * pitch_multiplier * stories_multiplier
 * 4. Midpoint Estimate = Adjusted Subtotal + permit_flat_fee
 * 5. Estimate Low = Round(Midpoint Estimate * (1 - range_spread_pct / 100))
 * 6. Estimate High = Round(Midpoint Estimate * (1 + range_spread_pct / 100))
 */

/**
 * Validates user answers against the dynamic configuration
 * @param {Object} config - The active configuration document from database
 * @param {Object} answers - Key-value pair of user responses
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateAnswers(config, answers = {}) {
  const errors = [];
  const activeQuestions = config.questions.filter((q) => q.active);

  for (const q of activeQuestions) {
    const val = answers[q.key];

    if (q.required && (val === undefined || val === null || val === '')) {
      errors.push(`Question "${q.label}" is required.`);
      continue;
    }

    if (val !== undefined && val !== null && val !== '') {
      if (q.type === 'number') {
        const numVal = Number(val);
        if (isNaN(numVal) || !isFinite(numVal)) {
          errors.push(`Question "${q.label}" must be a valid number.`);
        } else {
          if (q.min !== null && q.min !== undefined && numVal < q.min) {
            errors.push(`"${q.label}" cannot be less than ${q.min} ${q.unit || ''}`.trim());
          }
          if (q.max !== null && q.max !== undefined && numVal > q.max) {
            errors.push(`"${q.label}" cannot be greater than ${q.max} ${q.unit || ''}`.trim());
          }
        }
      } else if (q.type === 'select') {
        const validValues = (q.options || []).map((opt) => opt.value);
        if (!validValues.includes(String(val))) {
          errors.push(`Invalid option selected for "${q.label}".`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Computes price estimate range server-side
 * @param {Object} config - The configuration document from database
 * @param {Object} answers - Key-value map of submitted answers
 * @returns {Object} Calculated estimate with breakdown metrics
 */
export function calculateEstimate(config, answers = {}) {
  const { questions = [], modifiers = {} } = config;

  const roofArea = Number(answers['roof_area'] || 0);

  // Helper to extract matching option for active question
  const getSelectedOption = (questionKey) => {
    const q = questions.find((item) => item.key === questionKey && item.active);
    if (!q || !q.options) return null;
    const selectedVal = answers[questionKey];
    return q.options.find((opt) => opt.value === String(selectedVal)) || null;
  };

  const materialOpt = getSelectedOption('material');
  const pitchOpt = getSelectedOption('pitch');
  const layersOpt = getSelectedOption('layers');
  const storiesOpt = getSelectedOption('stories');

  // Safely cast rates and multipliers (handles string numbers like "1.12")
  const ratePerSqft = materialOpt?.rate_per_sqft !== undefined && materialOpt?.rate_per_sqft !== null
    ? Number(materialOpt.rate_per_sqft)
    : 0;

  const pitchMult = pitchOpt?.multiplier !== undefined && pitchOpt?.multiplier !== null
    ? Number(pitchOpt.multiplier)
    : 1.0;

  const tearOffPerSqft = layersOpt?.tear_off_per_sqft !== undefined && layersOpt?.tear_off_per_sqft !== null
    ? Number(layersOpt.tear_off_per_sqft)
    : 0;

  const storiesMult = storiesOpt?.multiplier !== undefined && storiesOpt?.multiplier !== null
    ? Number(storiesOpt.multiplier)
    : 1.0;

  // Extract modifiers with safe fallbacks
  const wasteFactor = Number(modifiers.waste_factor ?? 0.10);
  const permitFee = Number(modifiers.permit_flat_fee ?? 350);
  const spreadPct = Number(modifiers.range_spread_pct ?? 12) / 100;

  // Step 1: Base material cost with waste
  const baseMaterialCost = roofArea * ratePerSqft * (1 + wasteFactor);

  // Step 2: Tear-off cost for existing layers
  const tearOffCost = roofArea * tearOffPerSqft;

  // Step 3: Adjusted subtotal after applying architectural multipliers
  const adjustedSubtotal = (baseMaterialCost + tearOffCost) * pitchMult * storiesMult;

  // Step 4: Midpoint estimate including mandatory permit fee
  const midPointEstimate = adjustedSubtotal + permitFee;

  // Step 5: Low and high estimate range bounds
  const estimateLow = Math.round(midPointEstimate * (1 - spreadPct));
  const estimateHigh = Math.round(midPointEstimate * (1 + spreadPct));

  return {
    estimate_low: estimateLow,
    estimate_high: estimateHigh,
    estimate_mid: Math.round(midPointEstimate),
    breakdown: {
      roof_area: roofArea,
      rate_per_sqft: ratePerSqft,
      base_material_cost: Math.round(baseMaterialCost * 100) / 100,
      tear_off_cost: Math.round(tearOffCost * 100) / 100,
      pitch_multiplier: pitchMult,
      stories_multiplier: storiesMult,
      waste_factor: wasteFactor,
      permit_fee: permitFee,
      spread_pct: spreadPct * 100
    }
  };
}
