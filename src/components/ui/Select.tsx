import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full appearance-none rounded-2xl border border-folha/15 bg-white bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 pr-10 text-sm text-tinta shadow-sm outline-none transition focus:border-folha/30 focus:ring-2 focus:ring-folha/30 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8B82' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
