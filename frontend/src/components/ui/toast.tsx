'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';

type TimerMap = Record<string, number>;

const toneStyles: Record<'success' | 'info', string> = {
  success: 'border-primary/30 bg-primary/10 text-primary',
  info: 'border-border bg-card text-foreground'
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);
  const timers = useRef<TimerMap>({});

  useEffect(() => {
    toasts.forEach((toast) => {
      if (!timers.current[toast.id]) {
        timers.current[toast.id] = window.setTimeout(() => {
          remove(toast.id);
          delete timers.current[toast.id];
        }, 2500);
      }
    });

    const activeIds = new Set(toasts.map((toast) => toast.id));
    Object.keys(timers.current).forEach((id) => {
      if (!activeIds.has(id)) {
        window.clearTimeout(timers.current[id]);
        delete timers.current[id];
      }
    });
  }, [remove, toasts]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex max-w-[90vw] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg',
            toneStyles[toast.tone]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
