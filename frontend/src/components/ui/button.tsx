import { cn } from '../../utils/cn';
import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
}

export function Button({ className, size = 'md', ...props }: Props) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-sm' : 'px-2 py-1';
  return (
    <button
      className={cn('rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50', padding, className)}
      {...props}
    />
  );
}
