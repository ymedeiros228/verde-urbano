import { cn } from '@/lib/utils/cn';

export interface StepperStep {
  id: string;
  label: string;
}

interface ProgressStepperProps {
  steps: StepperStep[];
  /** índice 0-based do passo atual (já alcançado) */
  currentIndex: number;
  className?: string;
  /** Só barras + label do passo atual */
  compact?: boolean;
}

export function ProgressStepper({
  steps,
  currentIndex,
  className,
  compact = false,
}: ProgressStepperProps) {
  const current = steps[Math.min(currentIndex, steps.length - 1)];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const done = i <= currentIndex;
          return (
            <div
              key={step.id}
              className={cn(
                'min-w-0',
                compact ? 'flex-1' : 'flex flex-1 flex-col gap-1.5'
              )}
            >
              <div
                className={cn(
                  'rounded-full transition-colors',
                  compact ? 'h-1' : 'h-1.5',
                  done ? 'bg-folha' : 'bg-folha-muted/40'
                )}
              />
                  {!compact && (
                <span
                  className={cn(
                    'truncate text-xs font-medium leading-tight',
                    done ? 'text-folha' : 'text-tinta-muted'
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {compact && current && (
        <p className="mt-1.5 text-xs font-medium text-folha">
          {current.label}
          <span className="text-tinta-muted">
            {' '}
            · {currentIndex + 1}/{steps.length}
          </span>
        </p>
      )}
    </div>
  );
}
