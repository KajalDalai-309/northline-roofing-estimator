import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { validateAnswers, calculateEstimate } from '../services/pricingEngine.js';

export async function createEstimate(req, res) {
  try {
    const { name, phone, email, answers = {} } = req.body;

    // Validate Customer Contact Info
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a valid full name.' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Fetch active configuration from DB
    const config = await Config.findOne().sort({ config_version: -1 });
    if (!config) {
      return res.status(500).json({ error: 'System configuration is not initialized.' });
    }

    // Validate dynamic question answers
    const validation = validateAnswers(config, answers);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed for some questions.',
        details: validation.errors
      });
    }

    // Execute server-side pricing engine
    const calculation = calculateEstimate(config, answers);

    // Create unique lead ID
    const leadId = `ld_${Date.now()}`;

    // Persist lead to database
    const newLead = await Lead.create({
      lead_id: leadId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      config_version: config.config_version,
      answers,
      estimate_low: calculation.estimate_low,
      estimate_high: calculation.estimate_high,
      estimate_mid: calculation.estimate_mid,
      captured_at: new Date()
    });

    console.log(`[Lead Captured] ID: ${newLead.lead_id} | Customer: ${newLead.name} | Range: $${calculation.estimate_low} - $${calculation.estimate_high}`);

    return res.status(201).json({
      success: true,
      lead_id: newLead.lead_id,
      estimate_low: calculation.estimate_low,
      estimate_high: calculation.estimate_high,
      estimate_mid: calculation.estimate_mid,
      config_version: config.config_version,
      business: config.business,
      breakdown: calculation.breakdown
    });
  } catch (error) {
    console.error('[Estimate Creation Error]:', error);
    return res.status(500).json({ error: 'Internal server error while calculating estimate.' });
  }
}
