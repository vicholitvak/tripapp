'use client';

import { Check } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
}

interface OnboardingStepperProps {
  currentStep: number;
  steps: Step[];
}

export default function OnboardingStepper({ currentStep, steps }: OnboardingStepperProps) {
  const getStepStatus = (index: number): 'complete' | 'current' | 'upcoming' => {
    if (index < currentStep) return 'complete';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => {
          const status = getStepStatus(index);

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={`
                  group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0
                  ${
                    status === 'complete'
                      ? 'border-blue-600'
                      : status === 'current'
                      ? 'border-blue-600'
                      : 'border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Step Icon */}
                  <div
                    className={`
                      flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2
                      ${
                        status === 'complete'
                          ? 'bg-blue-600 border-blue-600'
                          : status === 'current'
                          ? 'border-blue-600 bg-white'
                          : 'border-gray-300 bg-white'
                      }
                    `}
                  >
                    {status === 'complete' ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <span
                        className={`
                          text-sm font-semibold
                          ${status === 'current' ? 'text-blue-600' : 'text-gray-500'}
                        `}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`
                        text-sm font-semibold
                        ${
                          status === 'complete'
                            ? 'text-blue-600'
                            : status === 'current'
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {step.name}
                    </span>
                    <p
                      className={`
                        text-sm mt-0.5
                        ${status === 'current' ? 'text-gray-900' : 'text-gray-500'}
                      `}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line (visible on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
