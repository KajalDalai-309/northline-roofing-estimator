import React from 'react';
import { User, Phone, Mail, Shield, Lock } from 'lucide-react';

export default function ContactStep({ contact, onChange, errors = {} }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 mb-2">
          <Lock className="w-3.5 h-3.5" /> Final Step • Instant Results
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Where should we send your official estimate?
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter your contact information below to instantly unlock your customized roof replacement estimate.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="name"
              value={contact.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. Jane Doe"
              className={`w-full pl-11 pr-4 py-3.5 text-base font-medium rounded-xl border bg-white shadow-sm transition focus:outline-none focus:ring-4 ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'
              }`}
              required
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.name}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              name="phone"
              value={contact.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="e.g. (614) 555-0148"
              className={`w-full pl-11 pr-4 py-3.5 text-base font-medium rounded-xl border bg-white shadow-sm transition focus:outline-none focus:ring-4 ${
                errors.phone
                  ? 'border-rose-400 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'
              }`}
              required
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.phone}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              name="email"
              value={contact.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="e.g. jane@example.com"
              className={`w-full pl-11 pr-4 py-3.5 text-base font-medium rounded-xl border bg-white shadow-sm transition focus:outline-none focus:ring-4 ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-100'
              }`}
              required
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Privacy guarantee */}
      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
        <Shield className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
        <p>
          We respect your privacy. Your information is strictly used by Dale at Northline Roofing to verify roof specs. We never sell your data or spam.
        </p>
      </div>
    </div>
  );
}
