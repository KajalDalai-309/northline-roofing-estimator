import React from 'react';
import { Minus, Plus, AlertCircle, Sparkles } from 'lucide-react';

export default function NumberField({ question, value, onChange, error }) {
  const min = question.min !== null && question.min !== undefined ? question.min : 100;
  const max = question.max !== null && question.max !== undefined ? question.max : 20000;
  const unit = question.unit || '';
  const numValue = value !== undefined && value !== null && value !== '' ? Number(value) : '';

  const handleIncrement = (amount) => {
    const current = numValue !== '' ? numValue : min;
    const next = Math.min(max, Math.max(min, current + amount));
    onChange(question.key, next);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(question.key, '');
      return;
    }
    const val = Number(raw);
    onChange(question.key, val);
  };

  // Quick preset sizes common for standard single-family homes
  const presets = [
    { label: 'Small (~1,200 sq ft)', value: 1200 },
    { label: 'Average (~2,000 sq ft)', value: 2000 },
    { label: 'Large (~3,200 sq ft)', value: 3200 },
    { label: 'Estate (~5,000 sq ft)', value: 5000 },
  ].filter(p => p.value >= min && p.value <= max);

  return (
    <div className="space-y-6">
      {/* Label & Description */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {question.label}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter the estimated total surface area of your roof in {unit || 'units'}.
        </p>
      </div>

      {/* Main Number Input with Controls */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          <div className="relative flex-1 w-full">
            <input
              type="number"
              min={min}
              max={max}
              value={numValue}
              onChange={handleInputChange}
              placeholder={`e.g. 2100`}
              className={`w-full text-2xl sm:text-3xl font-extrabold text-slate-900 px-5 py-4 rounded-xl border-2 bg-white shadow-sm transition focus:outline-none focus:ring-4 ${
                error
                  ? 'border-rose-400 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'
              }`}
              required={question.required}
            />
            {unit && (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm sm:text-base font-bold text-slate-400 pointer-events-none uppercase">
                {unit}
              </span>
            )}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleIncrement(-100)}
              className="flex-1 sm:flex-none p-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-sm active:scale-95 transition flex items-center justify-center gap-1"
              title="Decrease by 100"
            >
              <Minus className="w-5 h-5" />
              <span className="text-xs font-semibold sm:hidden">-100</span>
            </button>
            <button
              type="button"
              onClick={() => handleIncrement(100)}
              className="flex-1 sm:flex-none p-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-sm active:scale-95 transition flex items-center justify-center gap-1"
              title="Increase by 100"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-semibold sm:hidden">+100</span>
            </button>
          </div>
        </div>

        {/* Range Hint */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 font-medium">
          <span>Minimum: {min.toLocaleString()} {unit}</span>
          <span>Maximum: {max.toLocaleString()} {unit}</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
          Common Home Sizes (Click to apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(question.key, preset.value)}
              className={`p-3 text-left rounded-xl border transition text-xs font-medium ${
                numValue === preset.value
                  ? 'bg-sky-50 border-sky-500 text-sky-900 font-semibold ring-2 ring-sky-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
