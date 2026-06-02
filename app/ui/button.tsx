import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-lg bg-amber-50 px-4 text-sm font-medium text-black transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100 active:bg-amber-200 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
}
