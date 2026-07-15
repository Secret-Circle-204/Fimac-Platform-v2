'use client'

interface Step {
  label: string
  desc: string
}

interface StepProgressBarProps {
  currentStep: number
  steps: Step[]
}

export function StepProgressBar({ currentStep, steps }: StepProgressBarProps) {
  return (
    <div className="w-full select-none py-4">
      {/* Desktop Stepper */}
      <div className="hidden md:flex justify-between items-center relative px-8">
        {/* Background connector bar */}
        <div className="absolute left-10 right-10 top-6 h-[2px] bg-slate-100 -z-10 rounded-full" />

        {/* Active connector bar */}
        <div
          className="absolute left-10 top-6 h-[2px] bg-blue-900 transition-all duration-500 ease-out -z-10 rounded-full"
          style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 20px)` }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1
          const isActive = stepNum === currentStep
          const isCompleted = stepNum < currentStep

          return (
            <div key={idx} className="flex flex-col items-center relative flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-500 relative ${
                  isActive
                    ? 'border-blue-900 bg-blue-900 text-white scale-110 shadow-lg ring-4 ring-blue-900/10'
                    : isCompleted
                    ? 'border-blue-900 bg-white text-blue-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>0{stepNum}</span>
                )}
              </div>

              <div className="text-center mt-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isActive ? 'text-blue-900 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-[120px] mx-auto leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile/Tablet Stepper */}
      <div className="flex md:hidden flex-col items-center space-y-3 px-4">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-base">
          <span className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
            {currentStep}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 text-sm font-semibold">{steps.length}</span>
          <span className="ml-2 font-bold uppercase tracking-wider text-xs text-blue-900">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-900 h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
