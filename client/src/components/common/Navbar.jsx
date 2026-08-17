import React from 'react';
import { Home, ShieldCheck, Phone, Lock, ExternalLink, RefreshCw } from 'lucide-react';

export default function Navbar({ business = {}, currentView, onNavigate, configVersion }) {
  const businessName = business.name || 'Northline Roofing & Exteriors';
  const region = business.region || 'Columbus, OH';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onNavigate('estimator')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white group-hover:text-sky-400 transition">
                  {businessName}
                </span>
                {configVersion && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                    v{configVersion} Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <span>Serving {region} & Surrounding Areas</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline-flex items-center text-emerald-400 gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Licensed & Insured
                </span>
              </p>
            </div>
          </div>

          {/* Right Action Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>(614) 555-ROOF</span>
            </div>

            {currentView === 'estimator' ? (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-lg border border-slate-700 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Owner Portal</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('estimator')}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg transition shadow-md shadow-sky-600/30"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Estimator</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
