import { ReactNode } from 'react';

export function CartList({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
