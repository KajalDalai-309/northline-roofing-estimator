import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Clock, UserCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { fetchAdminHistory } from '../../services/api';

export default function HistoryLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
              >
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
                    <span className="flex items-center gap-1 text-[11px] text-sky-600 font-medium">
                      <FileCheck className="w-3 h-3" />
                      Snapshot Archived
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
