import { cn } from '@/lib/utils';

type ProgressStep = {
  id: string;
  title: string;
};

type ProgressStepsProps = {
  steps: ProgressStep[];
  currentStep: number;
};

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const status = index === currentStep ? 'active' : index < currentStep ? 'done' : 'idle';
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                status === 'done' && 'bg-primary text-white',
                status === 'active' && 'border-2 border-primary bg-primary/10 text-primary',
                status === 'idle' && 'border border-border bg-card text-foreground/55'
              )}
            >
              {index + 1}
            </span>
            <span className={cn('text-sm font-medium', status === 'idle' ? 'text-foreground/55' : 'text-foreground')}>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
