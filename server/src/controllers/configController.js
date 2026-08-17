import { Config } from '../models/Config.js';
import { ConfigHistory } from '../models/ConfigHistory.js';
import { initialConfig } from '../config/seedData.js';

/**
 * Public Config Endpoint: Returns active configuration for the estimator wizard
 * Sensitive pricing formulas/rates are not needed on frontend, only questions and choices.
 */
export async function getPublicConfig(req, res) {
  try {
    let config = await Config.findOne().sort({ config_version: -1 });

    if (!config) {
      // Auto-initialize if empty
      config = await Config.create(initialConfig);
    }

    // Filter to active questions only, sorted by order
    const activeQuestions = config.questions
      .filter((q) => q.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((q) => ({
        key: q.key,
        label: q.label,
        type: q.type,
        unit: q.unit || '',
        required: q.required !== false,
        min: q.min,
        max: q.max,
        order: q.order,
        active: true,
        options: (q.options || []).map((opt) => ({
          value: opt.value,
          label: opt.label
        }))
      }));

    return res.json({
      config_version: config.config_version,
      business: config.business || {
        name: 'Northline Roofing & Exteriors',
        region: 'Columbus, OH',
        currency: 'USD'
      },
      questions: activeQuestions
    });
  } catch (error) {
    console.error('[Config Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch public estimator configuration.' });
  }
}

/**
 * Admin Config Endpoint: Returns complete configuration for owner management
 */
export async function getAdminConfig(req, res) {
  try {
    let config = await Config.findOne().sort({ config_version: -1 });

    if (!config) {
      config = await Config.create(initialConfig);
    }

    return res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('[Admin Config Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch administrative configuration.' });
  }
}

/**
 * Admin Config Update: Updates questions, rates, multipliers, and modifiers
 * Automatically bumps config_version and records an audit log snapshot.
 */
export async function updateAdminConfig(req, res) {
  try {
    const { questions, modifiers, business, change_summary } = req.body;

    let currentConfig = await Config.findOne().sort({ config_version: -1 });
    if (!currentConfig) {
      currentConfig = await Config.create(initialConfig);
    }

    const nextVersion = (currentConfig.config_version || 1) + 1;

    // Normalize and clean incoming questions and options
    const normalizedQuestions = (questions || currentConfig.questions).map((q, idx) => ({
      key: q.key.trim().toLowerCase().replace(/\s+/g, '_'),
      label: q.label.trim(),
      type: q.type || 'select',
      unit: q.unit || '',
      required: q.required !== false,
      min: q.min !== undefined && q.min !== null && q.min !== '' ? Number(q.min) : null,
      max: q.max !== undefined && q.max !== null && q.max !== '' ? Number(q.max) : null,
      active: q.active !== false,
      order: q.order !== undefined ? Number(q.order) : idx + 1,
      options: (q.options || []).map((opt) => ({
        value: opt.value.trim(),
        label: opt.label.trim(),
        rate_per_sqft: opt.rate_per_sqft !== undefined && opt.rate_per_sqft !== '' && opt.rate_per_sqft !== null
          ? Number(opt.rate_per_sqft)
          : null,
        multiplier: opt.multiplier !== undefined && opt.multiplier !== '' && opt.multiplier !== null
          ? Number(opt.multiplier)
          : null,
        tear_off_per_sqft: opt.tear_off_per_sqft !== undefined && opt.tear_off_per_sqft !== '' && opt.tear_off_per_sqft !== null
          ? Number(opt.tear_off_per_sqft)
          : null
      }))
    }));

    const updatedModifiers = {
      waste_factor: modifiers?.waste_factor !== undefined ? Number(modifiers.waste_factor) : currentConfig.modifiers.waste_factor,
      permit_flat_fee: modifiers?.permit_flat_fee !== undefined ? Number(modifiers.permit_flat_fee) : currentConfig.modifiers.permit_flat_fee,
      range_spread_pct: modifiers?.range_spread_pct !== undefined ? Number(modifiers.range_spread_pct) : currentConfig.modifiers.range_spread_pct
    };

    const updatedBusiness = {
      name: business?.name?.trim() || currentConfig.business.name,
      region: business?.region?.trim() || currentConfig.business.region,
      currency: business?.currency?.trim() || currentConfig.business.currency
    };

    // Update config document
    currentConfig.config_version = nextVersion;
    currentConfig.questions = normalizedQuestions;
    currentConfig.modifiers = updatedModifiers;
    currentConfig.business = updatedBusiness;

    await currentConfig.save();

    // Create Audit History snapshot
    await ConfigHistory.create({
      config_version: nextVersion,
      changed_by: req.user?.username || 'admin',
      change_summary: change_summary || `Updated rates/questions to Version ${nextVersion}`,
      snapshot: {
        config_version: nextVersion,
        business: updatedBusiness,
        modifiers: updatedModifiers,
        questions: normalizedQuestions
      }
    });

    console.log(`[Config] Successfully updated to Version ${nextVersion}`);

    return res.json({
      success: true,
      message: `Configuration updated successfully to Version ${nextVersion}`,
      config: currentConfig
    });
  } catch (error) {
    console.error('[Config Update Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to update configuration.' });
  }
}

/**
 * Admin Version History Endpoint: Returns changelog snapshots
 */
export async function getConfigHistory(req, res) {
  try {
    const history = await ConfigHistory.find().sort({ config_version: -1 }).limit(20);
    return res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('[History Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch configuration history.' });
  }
}
