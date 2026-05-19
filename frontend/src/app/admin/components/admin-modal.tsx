'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
};

export function AdminModal({ open, title, description, children, footer, onClose, className }: AdminModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[180] flex items-end justify-center bg-slate-950/55 p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div className={cn('relative z-[181] w-full max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-6', className)}>
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
            {description ? <p className="mt-1 text-sm text-foreground/60">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 rounded-full p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 max-h-[72vh] overflow-auto pr-1">{children}</div>
        {footer ? <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}