import React from 'react';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer({ business = {} }) {
  const businessName = business.name || 'Northline Roofing & Exteriors';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-base mb-2">{businessName}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium residential roofing, replacements, and exterior craftsmanship in Columbus, OH. Built with honesty, durability, and transparent pricing.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-2">Our Promise</h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero hidden fees or surprise upcharges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Certified local installers & full warranty</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Permits & disposal included in quote</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-2">Platform Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              100% Config-Driven Lead & Cost Estimation Architecture. Server-side calculations with real-time rate synchronization.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-sky-400 font-medium bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/60 w-fit">
              <Sparkles className="w-3 h-3" /> Wantace Production Assignment
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} {businessName}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure Server-Side Calculation • No Client-Side Math Tampering</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
