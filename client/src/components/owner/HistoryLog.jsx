import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Clock, UserCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { fetchAdminHistory } from '../../services/api';

export default function HistoryLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configuration Version History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all price updates, modifier changes, and question modifications.
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            Loading version history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No previous version records found.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, idx) => (
              <div
                key={item._id || idx}
                className="flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    v{item.config_version}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {item.change_summary || `Version ${item.config_version} Published`}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.applied_at ? new Date(item.applied_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        By: {item.changed_by || 'Admin'}
                      </span>
                      <button 
                        onClick={() => toggleExpand(item._id)}
                        className="flex items-center gap-1 text-[11px] text-sky-600 font-bold hover:text-sky-800 transition bg-sky-100/50 px-2 py-0.5 rounded"
                      >
                        <FileCheck className="w-3 h-3" />
                        {expandedId === item._id ? 'Hide Snapshot' : 'View Snapshot'}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Snapshot Viewer */}
                {expandedId === item._id && item.snapshot && (
                  <div className="mt-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <h5 className="font-bold text-slate-800 text-sm mb-4">Configuration Snapshot</h5>
                    
                    {/* Modifiers */}
                    <div className="mb-6">
                      <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Global Pricing Modifiers</h6>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center sm:block sm:text-left">
                          <span className="block text-[11px] text-slate-500 font-bold uppercase sm:mb-1">Waste Factor</span>
                          <span className="font-mono text-sm font-bold text-sky-700">{item.snapshot.modifiers?.waste_factor}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center sm:block sm:text-left">
                          <span className="block text-[11px] text-slate-500 font-bold uppercase sm:mb-1">Permit Flat Fee</span>
                          <span className="font-mono text-sm font-bold text-sky-700">${item.snapshot.modifiers?.permit_flat_fee}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center sm:block sm:text-left">
                          <span className="block text-[11px] text-slate-500 font-bold uppercase sm:mb-1">Range Spread</span>
                          <span className="font-mono text-sm font-bold text-sky-700">±{item.snapshot.modifiers?.range_spread_pct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div>
                      <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Questions & Rates</h6>
                      <div className="space-y-3">
                        {item.snapshot.questions?.map((q, qIdx) => (
                          <div key={qIdx} className={`p-4 rounded-xl border ${q.active ? 'border-slate-200 bg-white shadow-sm' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-sm text-slate-800">{q.label}</span>
                              <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${q.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                {q.active ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </div>
                            
                            {q.type === 'number' && (
                              <div className="text-xs text-slate-600 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block">
                                Min: {q.min} | Max: {q.max} | Unit: {q.unit}
                              </div>
                            )}
                            
                            {q.type === 'select' && q.options?.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-slate-700 font-semibold">{opt.label}</span>
                                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                                      {opt.rate_per_sqft !== null && opt.rate_per_sqft !== undefined ? `$${opt.rate_per_sqft}/sq` : ''}
                                      {opt.multiplier !== null && opt.multiplier !== undefined ? `${opt.multiplier}x` : ''}
                                      {opt.tear_off_per_sqft !== null && opt.tear_off_per_sqft !== undefined ? ` (+$${opt.tear_off_per_sqft} tear-off)` : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
