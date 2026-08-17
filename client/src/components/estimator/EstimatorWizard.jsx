import React, { useState, useEffect } from 'react';
import DynamicField from '../dynamic/DynamicField';
import ContactStep from './ContactStep';
import EstimateResult from './EstimateResult';
import { fetchPublicConfig, submitEstimate } from '../../services/api';
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

export default function EstimatorWizard({ onConfigLoaded }) {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);

  // Wizard State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [stepErrors, setStepErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Fetch Config dynamically on Mount
  const loadConfiguration = async () => {
    setLoadingConfig(true);
    setConfigError(null);
    try {
      const data = await fetchPublicConfig();
      setConfig(data);
      if (onConfigLoaded) {
        onConfigLoaded(data);
      }
    } catch (err) {
      setConfigError(err.message || 'Failed to connect to estimation server.');
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  // Only include questions that are explicitly active
  const activeQuestions = config?.questions?.filter(q => q.active) || [];
  const totalSteps = activeQuestions.length + 1; // questions + contact step
  const isContactStep = currentStepIndex === activeQuestions.length;
  const currentQuestion = activeQuestions[currentStepIndex];

  // Handle Answer Changes
  const handleAnswerChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStepErrors((prev) => ({ ...prev, [key]: null }));
  };

  // Handle Contact Changes
  const handleContactChange = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    setStepErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Per-step validation
  const validateCurrentStep = () => {
    const errors = {};

    if (!isContactStep && currentQuestion) {
      const val = answers[currentQuestion.key];

      if (currentQuestion.required && (val === undefined || val === null || val === '')) {
        errors[currentQuestion.key] = `Please answer this question to proceed.`;
      } else if (currentQuestion.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          errors[currentQuestion.key] = 'Please enter a valid numeric value.';
        } else if (currentQuestion.min !== null && currentQuestion.min !== undefined && num < currentQuestion.min) {
          errors[currentQuestion.key] = `Value cannot be less than ${currentQuestion.min} ${currentQuestion.unit || ''}`;
        } else if (currentQuestion.max !== null && currentQuestion.max !== undefined && num > currentQuestion.max) {
          errors[currentQuestion.key] = `Value cannot be greater than ${currentQuestion.max} ${currentQuestion.unit || ''}`;
        }
      }
    } else if (isContactStep) {
      if (!contact.name || contact.name.trim().length < 2) {
        errors.name = 'Please enter your full name.';
      }
      if (!contact.phone || contact.phone.trim().length < 7) {
        errors.phone = 'Please enter a valid phone number.';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!contact.email || !emailRegex.test(contact.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation: Next Step or Final Calculation
  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (!isContactStep) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final Submit
      setSubmitting(true);
      setSubmissionError(null);
      try {
        const payload = {
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim().toLowerCase(),
          answers
        };
        const result = await submitEstimate(payload);
        setCalculationResult(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setSubmissionError(err.message || 'Server calculation failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setStepErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRestart = () => {
    setCalculationResult(null);
    setCurrentStepIndex(0);
    setAnswers({});
    setContact({ name: '', phone: '', email: '' });
    setStepErrors({});
    loadConfiguration();
  };

  // 1. Loading State
  if (loadingConfig) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 mb-4 animate-bounce">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Connecting to Dynamic Estimator Engine</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Fetching current material rates, pitch parameters, and questions from the live database...
        </p>
      </div>
    );
  }

  // 2. Config Error State
  if (configError || !config) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl border border-rose-200 shadow-xl text-center my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Configuration Unavailable</h3>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          {configError || 'Unable to load dynamic configuration.'}
        </p>
        <button
          type="button"
          onClick={loadConfiguration}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition shadow-md"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // 3. Show Final Calculation Result Card
  if (calculationResult) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <EstimateResult
          result={calculationResult}
          onRestart={handleRestart}
          business={config.business}
        />
      </div>
    );
  }

  // Calculate Progress %
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Wizard Card Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* Progress Bar & Header */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-300 mb-2">
            <span>
              Step {currentStepIndex + 1} of {totalSteps}: {isContactStep ? 'Contact Details' : 'Roof Details'}
            </span>
            <span className="text-sky-400 font-mono font-bold">{progressPercent}%</span>
          </div>
          {/* Animated Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 sm:p-10">
          {!isContactStep && currentQuestion ? (
            <DynamicField
              question={currentQuestion}
              value={answers[currentQuestion.key]}
              onChange={handleAnswerChange}
              error={stepErrors[currentQuestion.key]}
            />
          ) : (
            <ContactStep
              contact={contact}
              onChange={handleContactChange}
              errors={stepErrors}
            />
          )}

          {/* Submission Error Banner */}
          {submissionError && (
            <div className="mt-6 flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-100">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-98 rounded-xl shadow-lg shadow-sky-600/25 transition disabled:opacity-50 ml-auto"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Price...</span>
                </>
              ) : isContactStep ? (
                <>
                  <span>Calculate My Cost</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Trust Badges */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-1">
          <Shield className="w-4 h-4 text-sky-600" />
          <span>Config-Driven Precision</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>No Obligation Quote</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Instant Calculation</span>
        </div>
      </div>

      {/* Version Badge */}
      {config?.version && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-mono text-slate-400 border border-slate-200/60 shadow-sm" title="Active Pricing Formula Version">
             Pricing Engine: v{config.version}
          </span>
        </div>
      )}

    </div>
  );
}
