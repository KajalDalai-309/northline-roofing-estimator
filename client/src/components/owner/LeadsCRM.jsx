import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, ChevronDown, ChevronUp, User, Phone, Mail, Calendar, DollarSign, Tag, AlertCircle } from 'lucide-react';
import { fetchAdminLeads, getAuthToken } from '../../services/api';

export default function LeadsCRM() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState(null);

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminLeads();
      setLeads(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filter leads by search query
  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = lead.name?.toLowerCase().includes(q);
    const emailMatch = lead.email?.toLowerCase().includes(q);
    const phoneMatch = lead.phone?.toLowerCase().includes(q);
    const idMatch = lead.lead_id?.toLowerCase().includes(q);
    return nameMatch || emailMatch || phoneMatch || idMatch;
  });

  // Handle CSV Download
  const handleExportCSV = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/leads/export-csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `northline_leads_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('CSV Export Error: ' + err.message);
    }
  };

  const toggleExpand = (id) => {
    setExpandedLeadId(expandedLeadId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Captured Roofing Leads CRM</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {leads.length} leads captured with exact submitted questions and calculated pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={loadLeads}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads by customer name, phone, email, or lead ID..."
          className="w-full pl-10 pr-4 py-3 bg-white text-xs font-medium rounded-2xl border border-slate-200 focus:outline-none focus:border-sky-500 shadow-sm"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Leads Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Loading leads data...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">No matching leads found.</p>
            <p className="text-xs text-slate-400 mt-1">Submit a test estimate from the Public Estimator to see it appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const isExpanded = expandedLeadId === lead._id || expandedLeadId === lead.lead_id;
              const dateStr = lead.captured_at ? new Date(lead.captured_at).toLocaleString() : 'N/A';
              const answers = lead.answers || {};

              return (
                <div key={lead._id || lead.lead_id} className="transition hover:bg-slate-50/70">
                  {/* Lead Row */}
                  <div
                    onClick={() => toggleExpand(lead._id || lead.lead_id)}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                  >
                    {/* Customer Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{lead.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600">
                            {lead.lead_id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            v{lead.config_version}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lead.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estimate Range & Expand Arrow */}
                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Calculated Estimate
                        </span>
                        <span className="text-base font-extrabold text-slate-900">
                          ${lead.estimate_low?.toLocaleString()} - ${lead.estimate_high?.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Answers Detail Accordion */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 bg-slate-50 border-t border-slate-100 text-xs">
                      <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
                        Submitted Questionnaire Answers (Recorded at runtime)
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(answers).map(([key, val]) => (
                          <div key={key} className="bg-white p-3 rounded-xl border border-slate-200/80">
                            <span className="font-mono text-[10px] text-slate-400 uppercase block mb-0.5">
                              {key}
                            </span>
                            <span className="font-bold text-slate-800 text-xs break-words">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
