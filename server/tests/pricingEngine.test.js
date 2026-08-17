import { describe, it, expect } from 'vitest';
import { calculateEstimate, validateAnswers } from '../src/services/pricingEngine.js';
import { initialConfig } from '../src/config/seedData.js';

describe('Pricing Engine - Arithmetic & Formula Correctness', () => {
  it('should calculate the estimate accurately for standard inputs', () => {
    const answers = {
      roof_area: 2000,
      material: 'asphalt_arch', // rate: 5.90
      pitch: 'medium',          // mult: 1.12 (string normalized)
      layers: '1',              // tear_off: 1.15
      stories: '2'              // mult: 1.08
    };

    const result = calculateEstimate(initialConfig, answers);

    // Manual Verification:
    // Base Material Cost = 2000 * 5.90 * 1.10 = 12,980
    // Tear-off Cost = 2000 * 1.15 = 2,300
    // Adjusted Subtotal = (12980 + 2300) * 1.12 * 1.08 = 15280 * 1.2096 = 18,482.688
    // Midpoint = 18482.688 + 350 = 18,832.688
    // Low = Math.round(18832.688 * 0.88) = 16,573
    // High = Math.round(18832.688 * 1.12) = 21,093

    expect(result.estimate_low).toBe(16573);
    expect(result.estimate_high).toBe(21093);
    expect(result.estimate_mid).toBe(18833);
    expect(result.breakdown.base_material_cost).toBe(12980);
    expect(result.breakdown.tear_off_cost).toBe(2300);
  });

  it('should handle string multiplier gracefully (as in raw seed data)', () => {
    const rawConfigWithStringMultiplier = {
      ...initialConfig,
      questions: initialConfig.questions.map((q) => {
        if (q.key === 'pitch') {
          return {
            ...q,
            options: [
              { value: 'medium', label: 'Medium', multiplier: '1.12' } // String float
            ]
          };
        }
        return q;
      })
    };

    const answers = {
      roof_area: 1000,
      material: 'asphalt_3tab', // rate: 4.25
      pitch: 'medium',
      layers: '0',              // tear_off: 0
      stories: '1'              // mult: 1.0
    };

    const result = calculateEstimate(rawConfigWithStringMultiplier, answers);
    // Base Material = 1000 * 4.25 * 1.10 = 4675
    // Tear-off = 0
    // Subtotal = 4675 * 1.12 * 1.0 = 5236
    // Mid = 5236 + 350 = 5586
    // Low = 5586 * 0.88 = 4916
    // High = 5586 * 1.12 = 6256

    expect(result.estimate_low).toBe(4916);
    expect(result.estimate_high).toBe(6256);
  });

  it('should ignore inactive questions and fallback to neutral defaults', () => {
    const configWithInactiveStories = {
      ...initialConfig,
      questions: initialConfig.questions.map((q) => {
        if (q.key === 'stories') {
          return { ...q, active: false };
        }
        return q;
      })
    };

    const answers = {
      roof_area: 1000,
      material: 'asphalt_3tab',
      pitch: 'low',
      layers: '0',
      stories: '3' // Deactivated question should not apply 1.18 multiplier
    };

    const result = calculateEstimate(configWithInactiveStories, answers);
    // Stories multiplier should fallback to 1.0 instead of 1.18
    expect(result.breakdown.stories_multiplier).toBe(1.0);
  });
});

describe('Pricing Engine - Dynamic Input Validation', () => {
  it('should pass validation for valid complete answers', () => {
    const validAnswers = {
      roof_area: 2500,
      material: 'metal_standing',
      pitch: 'low',
      layers: '0',
      stories: '1'
    };

    const val = validateAnswers(initialConfig, validAnswers);
    expect(val.isValid).toBe(true);
    expect(val.errors).toHaveLength(0);
  });

  it('should reject roof_area below minimum constraint (300 sq ft)', () => {
    const invalidAnswers = {
      roof_area: 150,
      material: 'metal_standing',
      pitch: 'low',
      layers: '0',
      stories: '1'
    };

    const val = validateAnswers(initialConfig, invalidAnswers);
    expect(val.isValid).toBe(false);
    expect(val.errors[0]).toContain('cannot be less than 300');
  });

  it('should reject roof_area exceeding maximum constraint (12,000 sq ft)', () => {
    const invalidAnswers = {
      roof_area: 15000,
      material: 'metal_standing',
      pitch: 'low',
      layers: '0',
      stories: '1'
    };

    const val = validateAnswers(initialConfig, invalidAnswers);
    expect(val.isValid).toBe(false);
    expect(val.errors[0]).toContain('cannot be greater than 12000');
  });

  it('should reject unknown option value for select question', () => {
    const invalidAnswers = {
      roof_area: 1500,
      material: 'gold_foil_roofing', // Unknown material
      pitch: 'low',
      layers: '0',
      stories: '1'
    };

    const val = validateAnswers(initialConfig, invalidAnswers);
    expect(val.isValid).toBe(false);
    expect(val.errors[0]).toContain('Invalid option selected');
  });
});
