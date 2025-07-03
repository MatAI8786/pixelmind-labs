import { cn } from '../../utils/cn';
import { HTMLAttributes } from 'react';

export function Table(props: HTMLAttributes<HTMLTableElement>) {
  return <table {...props} className={cn('w-full text-sm', props.className)} />;
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...props} className={cn('bg-gray-100 dark:bg-gray-800', props.className)} />
  );
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn('border-b last:border-b-0', props.className)} />;
}

export function TableHead(props: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn('text-left font-semibold px-2 py-1 sticky top-0 bg-gray-100 dark:bg-gray-800', props.className)}
    />
  );
}

export function TableCell(props: HTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn('px-2 py-1', props.className)} />;
}
