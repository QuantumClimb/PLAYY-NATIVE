import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1 to 5
  onSelectStep: (step: number) => void;
  maxReachedStep?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep = 5,
}) => {
  const steps = [
    { id: 1, label: 'Head' },
    { id: 2, label: 'Pose' },
    { id: 3, label: 'Symbol' },
    { id: 4, label: 'Background' },
    { id: 5, label: 'Finished' },
  ];

  return (
    <div className="w-full flex items-center justify-between px-2 py-2 max-w-md mx-auto">
      {steps.map((step, idx) => {
        const isCurrent = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = step.id <= maxReachedStep;

        return (
          <React.Fragment key={step.id}>
            {/* Step Node */}
            <button
              type="button"
              onClick={() => isClickable && onSelectStep(step.id)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1 group transition-all ${
                isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                  isCurrent
                    ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200 scale-110'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight ${
                  isCurrent ? 'text-amber-600' : isCompleted ? 'text-emerald-700' : 'text-slate-600'
                }`}
              >
                {step.label}
              </span>
            </button>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                  currentStep > idx + 1 ? 'bg-emerald-400' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
