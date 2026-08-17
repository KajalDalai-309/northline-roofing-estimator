import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import EstimatorWizard from './components/estimator/EstimatorWizard';
import OwnerPanel from './components/owner/OwnerPanel';

export default function App() {
  const [currentView, setCurrentView] = useState('estimator'); // 'estimator' | 'admin'
  const [configMeta, setConfigMeta] = useState({
    version: null,
    business: { name: 'Northline Roofing & Exteriors', region: 'Columbus, OH', currency: 'USD' }
  });

  const handleConfigLoaded = (config) => {
    if (config) {
      setConfigMeta({
        version: config.config_version,
        business: config.business || { name: 'Northline Roofing & Exteriors', region: 'Columbus, OH', currency: 'USD' }
      });
    }
  };

  const handleConfigUpdated = (newConfig) => {
    if (newConfig) {
      setConfigMeta({
        version: newConfig.config_version,
        business: newConfig.business || configMeta.business
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        business={configMeta.business}
        currentView={currentView}
        onNavigate={setCurrentView}
        configVersion={configMeta.version}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentView === 'estimator' ? (
          <EstimatorWizard onConfigLoaded={handleConfigLoaded} />
        ) : (
          <OwnerPanel onConfigUpdated={handleConfigUpdated} />
        )}
      </main>

      {/* Footer */}
      <Footer business={configMeta.business} />
    </div>
  );
}
