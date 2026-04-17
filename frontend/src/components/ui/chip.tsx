import { cn } from '@/lib/utils';

type ChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      className={cn(
        'focus-ring rounded-full border px-3 py-1.5 text-sm font-medium transition',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-foreground/70 hover:bg-muted'
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
