import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Plus, Trash2, CheckCircle, AlertCircle, Sparkles, Layers, DollarSign, Percent, ToggleLeft, ToggleRight } from 'lucide-react';
import { fetchAdminConfig, saveAdminConfig } from '../../services/api';

export default function RatesEditor({ onConfigSaved }) {
  const [config, setConfig] = useState(null);
  const [originalDataStr, setOriginalDataStr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [changeSummary, setChangeSummary] = useState('');

  // Load config on mount
  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminConfig();
      setConfig(data);
      setOriginalDataStr(JSON.stringify({ q: data.questions, m: data.modifiers }));
    } catch (err) {
      setError(err.message || 'Failed to load configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Update question property
  const handleQuestionChange = (qIndex, field, value) => {
    const next = { ...config };
    next.questions[qIndex][field] = value;
    setConfig(next);
  };

  // Toggle active status
  const handleToggleQuestionActive = (qIndex) => {
    const next = { ...config };
    next.questions[qIndex].active = !next.questions[qIndex].active;
    setConfig(next);
  };

  // Update option property (rate, multiplier, tear_off, label)
  const handleOptionChange = (qIndex, optIndex, field, value) => {
    const next = { ...config };
    const numericFields = ['rate_per_sqft', 'multiplier', 'tear_off_per_sqft'];
    
    if (numericFields.includes(field)) {
      next.questions[qIndex].options[optIndex][field] = value === '' ? null : Number(value);
    } else {
      next.questions[qIndex].options[optIndex][field] = value;
    }
    setConfig(next);
  };

  // Add new option to question
  const handleAddOption = (qIndex) => {
    const next = { ...config };
    const q = next.questions[qIndex];
    const newOpt = {
      value: `custom_${Date.now()}`,
      label: 'New Option',
      rate_per_sqft: q.key === 'material' ? 6.00 : null,
      multiplier: q.key === 'pitch' || q.key === 'stories' ? 1.05 : null,
      tear_off_per_sqft: q.key === 'layers' ? 1.50 : null
    };
    next.questions[qIndex].options.push(newOpt);
    setConfig(next);
  };

  // Delete option from question
  const handleDeleteOption = (qIndex, optIndex) => {
    const next = { ...config };
    next.questions[qIndex].options.splice(optIndex, 1);
    setConfig(next);
  };

  // Update modifier property
  const handleModifierChange = (field, value) => {
    const next = { ...config };
    next.modifiers[field] = value === '' ? 0 : Number(value);
    setConfig(next);
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(null);

    try {
      const currentDataStr = JSON.stringify({ q: config.questions, m: config.modifiers });
      if (currentDataStr === originalDataStr) {
        alert("No changes detected. You are already on the latest version.");
        setSaving(false);
        return;
      }

      const summary = changeSummary.trim() || 'Updated pricing rates and options';
      const updated = await saveAdminConfig(config, summary);
      setConfig(updated);
      setOriginalDataStr(JSON.stringify({ q: updated.questions, m: updated.modifiers }));
      setSaveSuccess(`Version ${updated.config_version} is now live! Customers will see updated rates immediately.`);
      setChangeSummary('');
      if (onConfigSaved) onConfigSaved(updated);
    } catch (err) {
      setError(err.message || 'Failed to save updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading live configuration...</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-rose-800">{error}</p>
        <button onClick={loadConfig} className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  const modifiers = config.modifiers || {};
  const questions = config.questions || [];

  return (
    <form onSubmit={handleSave} className="space-y-8">
      
      {/* Top Banner with Version Badge & Save Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-slate-950">
              Active Config: v{config.config_version}
            </span>
            <span className="text-xs text-slate-400">Zero downtime live updates</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Pricing & Question Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Marcus & Dale: Any edits saved here immediately update the customer pricing formula without redeploying.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Version...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </>
          )}
        </button>
      </div>

      {/* Success Alert Toast */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Global Business Modifiers */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Percent className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Global Pricing Modifiers</h3>
            <p className="text-xs text-slate-500">Formulas and buffer multipliers applied across all estimates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Waste Factor (e.g. 0.10 for 10%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="0.5"
              value={modifiers.waste_factor ?? 0.10}
              onChange={(e) => handleModifierChange('waste_factor', e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Current: {(modifiers.waste_factor * 100).toFixed(0)}% waste included</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              City Permit Flat Fee ($)
            </label>
            <input
              type="number"
              step="10"
              min="0"
              value={modifiers.permit_flat_fee ?? 350}
              onChange={(e) => handleModifierChange('permit_flat_fee', e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Added to every calculated job</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Range Spread (± %)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="50"
              value={modifiers.range_spread_pct ?? 12}
              onChange={(e) => handleModifierChange('range_spread_pct', e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Range tolerance (±{modifiers.range_spread_pct}%)</span>
          </div>
        </div>
      </div>

      {/* Questions & Rates List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-900">Dynamic Questions & Rates</h3>
          </div>
          <span className="text-xs text-slate-500">
            {questions.filter(q => q.active).length} of {questions.length} Active
          </span>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={q.key || qIndex}
            className={`bg-white rounded-3xl border-2 transition-all p-6 sm:p-7 shadow-sm ${
              q.active ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60 bg-slate-50/70'
            }`}
          >
            {/* Question Header & Active Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={q.label}
                  onChange={(e) => handleQuestionChange(qIndex, 'label', e.target.value)}
                  className="w-full text-base sm:text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none py-1 transition"
                  placeholder="Question Label..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleQuestionActive(qIndex)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    q.active
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {q.active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                  <span>{q.active ? 'Active on Site' : 'Disabled (Hidden)'}</span>
                </button>
              </div>
            </div>

            <div className={!q.active ? 'pointer-events-none opacity-40 grayscale select-none' : ''}>
              {/* Type: Number Configuration */}
              {q.type === 'number' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Unit Label</label>
                  <input
                    type="text"
                    value={q.unit || ''}
                    onChange={(e) => handleQuestionChange(qIndex, 'unit', e.target.value)}
                    placeholder="e.g. sq ft"
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Minimum Limit</label>
                  <input
                    type="number"
                    value={q.min ?? ''}
                    onChange={(e) => handleQuestionChange(qIndex, 'min', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Maximum Limit</label>
                  <input
                    type="number"
                    value={q.max ?? ''}
                    onChange={(e) => handleQuestionChange(qIndex, 'max', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            )}

            {/* Type: Select Options Table */}
            {q.type === 'select' && (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Choice Label</span>
                  <span>Calculated Rate / Factor</span>
                </div>

                <div className="space-y-2.5">
                  {(q.options || []).map((opt, optIndex) => (
                    <div
                      key={opt.value || optIndex}
                      className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200"
                    >
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, 'label', e.target.value)}
                          className="w-full text-xs font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                          placeholder="Option Label"
                        />
                      </div>

                      {/* Specific Rate Fields depending on question key */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {opt.rate_per_sqft !== undefined && opt.rate_per_sqft !== null && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500 font-medium">$</span>
                            <input
                              type="number"
                              step="0.05"
                              value={opt.rate_per_sqft}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, 'rate_per_sqft', e.target.value)}
                              className="w-24 px-2 py-1.5 text-xs font-bold text-sky-800 bg-white rounded-lg border border-slate-300 text-right"
                              title="Rate per sq ft"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">/sqft</span>
                          </div>
                        )}

                        {opt.multiplier !== undefined && opt.multiplier !== null && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={opt.multiplier}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, 'multiplier', e.target.value)}
                              className="w-20 px-2 py-1.5 text-xs font-bold text-sky-800 bg-white rounded-lg border border-slate-300 text-right"
                              title="Multiplier"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">x mult</span>
                          </div>
                        )}

                        {opt.tear_off_per_sqft !== undefined && opt.tear_off_per_sqft !== null && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500 font-medium">$</span>
                            <input
                              type="number"
                              step="0.05"
                              value={opt.tear_off_per_sqft}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, 'tear_off_per_sqft', e.target.value)}
                              className="w-24 px-2 py-1.5 text-xs font-bold text-sky-800 bg-white rounded-lg border border-slate-300 text-right"
                              title="Tear off rate per sq ft"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">/sqft</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteOption(qIndex, optIndex)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddOption(qIndex)}
                  className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 py-1.5 px-3 rounded-lg hover:bg-sky-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Choice Option</span>
                </button>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>

      {/* Change Summary Note Input & Sticky Save Footer */}
      <div className="p-6 bg-slate-100 rounded-3xl border border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:flex-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Reason for Change (Saved to Version Audit Log)
          </label>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g. Dale updated Shingle rates per supplier price rise"
            className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/25 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Version...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Version {config.config_version + 1}</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}
