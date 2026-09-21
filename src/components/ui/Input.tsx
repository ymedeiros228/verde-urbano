import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const fieldBase =
  'w-full rounded-2xl border border-folha/15 bg-white text-sm text-tinta shadow-sm outline-none transition placeholder:text-tinta-faint focus:border-folha/30 focus:ring-2 focus:ring-folha/30 disabled:cursor-not-allowed disabled:opacity-50';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(fieldBase, 'h-11 px-4', className)}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(fieldBase, 'min-h-[6rem] px-4 py-3', className)}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export interface SearchFieldProps extends Omit<InputProps, 'type'> {
  wrapperClassName?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, wrapperClassName, ...props }, ref) => (
    <label className={cn('relative block', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-faint"
        aria-hidden
      />
      <Input
        ref={ref}
        type="search"
        className={cn('pl-11', className)}
        {...props}
      />
    </label>
  )
);
SearchField.displayName = 'SearchField';
