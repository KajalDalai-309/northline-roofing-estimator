import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function SelectField({ question, value, onChange, error }) {
  const options = question.options || [];

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {question.label}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Select the option that best describes your property.
        </p>
      </div>

      {/* Options Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-3.5">
        {options.map((opt) => {
          const isSelected = String(value) === String(opt.value);

          return (
            <label
              key={opt.value}
              onClick={() => onChange(question.key, opt.value)}
              className={`relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-sky-50/80 border-sky-600 shadow-md shadow-sky-600/10 ring-2 ring-sky-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 pr-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                    isSelected ? 'text-sky-600' : 'text-slate-300'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 fill-sky-600 text-white" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <span
                    className={`text-base font-semibold block transition ${
                      isSelected ? 'text-sky-950 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>
              </div>

              {/* Hidden native radio for accessibility */}
              <input
                type="radio"
                name={question.key}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(question.key, opt.value)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
