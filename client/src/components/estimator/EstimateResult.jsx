import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, ChevronDown, ChevronUp, RotateCcw, Calendar, Phone, FileText, Check } from 'lucide-react';

export default function EstimateResult({ result, onRestart, business = {} }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const low = result.estimate_low || 0;
  const high = result.estimate_high || 0;
  const mid = result.estimate_mid || Math.round((low + high) / 2);
  const currency = business.currency === 'USD' || !business.currency ? '$' : business.currency;

  const breakdown = result.breakdown || {};
  const roofArea = breakdown.roof_area || 0;
  const pricePerSqftLow = roofArea > 0 ? (low / roofArea).toFixed(2) : '0.00';
  const pricePerSqftHigh = roofArea > 0 ? (high / roofArea).toFixed(2) : '0.00';

  const formatMoney = (amount) => {
    return `${currency}${Number(amount).toLocaleString('en-US')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Congratulatory Banner */}
      <div className="text-center pb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner mb-3">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Customized Roof Estimate
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Calculated dynamically based on your exact roof square footage, pitch, material specifications, and current market rates.
        </p>
      </div>

      {/* Main Pricing Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-700">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold uppercase tracking-wider text-sky-400 mb-2">
            <span>Estimated Project Range</span>
            <span className="bg-sky-900/80 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-700 text-xs">
              Config v{result.config_version}
            </span>
          </div>

          {/* Large Cost Range */}
          <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white my-3 flex flex-wrap items-baseline gap-2">
            <span className="text-sky-300">{formatMoney(low)}</span>
            <span className="text-slate-400 font-light text-2xl sm:text-3xl">to</span>
            <span className="text-white">{formatMoney(high)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/80 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block font-medium">Estimated Midpoint</span>
              <span className="text-base sm:text-lg font-bold text-slate-100">{formatMoney(mid)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Approx. Unit Rate</span>
              <span className="text-base sm:text-lg font-bold text-sky-300">
                {currency}{pricePerSqftLow} - {currency}{pricePerSqftHigh} <span className="text-xs font-normal text-slate-400">/ sq ft</span>
              </span>
            </div>
          </div>
        </div>

        {/* Lead Reference Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Lead Reference: <code className="text-sky-300 font-mono">{result.lead_id}</code></span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Guaranteed for 30 Days
          </span>
        </div>
      </div>

      {/* Included Guarantees & Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">
          <span className="font-bold text-slate-900 block">✓ Permits Included</span>
          <span className="text-slate-500">City permits and code inspections covered.</span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">
          <span className="font-bold text-slate-900 block">✓ 10% Waste Factor</span>
          <span className="text-slate-500">Ridge caps, valleys & cuts pre-calculated.</span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">
          <span className="font-bold text-slate-900 block">✓ Certified Crew</span>
          <span className="text-slate-500">Licensed, insured installers in Columbus.</span>
        </div>
      </div>

      {/* Expandable Mathematical Breakdown */}
      {breakdown.roof_area && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 hover:bg-slate-50 transition text-sm"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>View Detailed Cost Breakdown</span>
            </span>
            {showBreakdown ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showBreakdown && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Roof Area:</span>
                <span className="font-semibold text-slate-900">{breakdown.roof_area.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Material Rate:</span>
                <span className="font-semibold text-slate-900">{currency}{breakdown.rate_per_sqft.toFixed(2)} / sq ft</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Material Subtotal (+10% Waste):</span>
                <span className="font-semibold text-slate-900">{formatMoney(breakdown.base_material_cost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Old Roof Tear-Off & Disposal:</span>
                <span className="font-semibold text-slate-900">{formatMoney(breakdown.tear_off_cost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pitch Multiplier:</span>
                <span className="font-semibold text-slate-900">{breakdown.pitch_multiplier}x</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Stories Multiplier:</span>
                <span className="font-semibold text-slate-900">{breakdown.stories_multiplier}x</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>City Permit & Flat Fee:</span>
                <span className="font-semibold text-slate-900">{formatMoney(breakdown.permit_fee)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>Spread Tolerance:</span>
                <span className="font-semibold text-slate-900">±{breakdown.spread_pct}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => setScheduled(true)}
          disabled={scheduled}
          className={`w-full py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-lg ${
            scheduled
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25 active:scale-98'
          }`}
        >
          {scheduled ? (
            <>
              <Check className="w-5 h-5" />
              <span>Inspection Request Sent to Dale!</span>
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              <span>Book Free On-Site Inspection with Dale</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition text-sm flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Estimate Another Roof</span>
        </button>
      </div>

    </div>
  );
}
