import { cn } from '@/lib/utils';

export function PasswordStrength({ 
  
  
  password }: { password: string }) {
  const score = getStrength(password);
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className={cn('h-1.5 flex-1 rounded-full', index < score ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>
      <p className="text-xs text-foreground/60">Password strength: {label}</p>
    </div>
  );
}

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}
