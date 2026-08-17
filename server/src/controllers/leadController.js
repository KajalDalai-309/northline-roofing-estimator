import { Lead } from '../models/Lead.js';

export async function getAdminLeads(req, res) {
  try {
    const leads = await Lead.find().sort({ captured_at: -1 });
    return res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('[Leads Fetch Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch leads list.' });
  }
}

export async function exportLeadsCSV(req, res) {
  try {
    const leads = await Lead.find().sort({ captured_at: -1 });

    const headers = [
      'Lead ID',
      'Date Captured (UTC)',
      'Config Version',
      'Customer Name',
      'Phone Number',
      'Email Address',
      'Estimate Low (USD)',
      'Estimate High (USD)',
      'Roof Area (sq ft)',
      'Material',
      'Pitch',
      'Layers',
      'Stories',
      'Raw Answers JSON'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = leads.map((lead) => {
      const ans = lead.answers || {};
      return [
        escapeCsv(lead.lead_id),
        escapeCsv(lead.captured_at ? new Date(lead.captured_at).toISOString() : ''),
        escapeCsv(lead.config_version),
        escapeCsv(lead.name),
        escapeCsv(lead.phone),
        escapeCsv(lead.email),
        escapeCsv(lead.estimate_low),
        escapeCsv(lead.estimate_high),
        escapeCsv(ans.roof_area || ''),
        escapeCsv(ans.material || ''),
        escapeCsv(ans.pitch || ''),
        escapeCsv(ans.layers || ''),
        escapeCsv(ans.stories || ''),
        escapeCsv(JSON.stringify(ans))
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=northline_leads_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[CSV Export Error]:', error);
    return res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
}
