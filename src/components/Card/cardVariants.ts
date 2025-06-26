import { cva } from 'class-variance-authority';

export const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm transition-all',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-md border-border/50',
        outline: 'border-2 shadow-none',
        ghost: 'border-none shadow-none bg-transparent',
        // 구독 관련
        subscription: 'border-pink-200 hover:shadow-md hover:border-pink-300',
        selected: 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-500/20',
        // 상태별
        success: 'border-green-200 bg-green-50',
        warning: 'border-amber-200 bg-amber-50',
        error: 'border-red-200 bg-red-50',
        // 하이라이트
        highlight: 'border-yellow-300 bg-yellow-50 ring-2 ring-yellow-300/30',
      },
      size: {
        sm: 'gap-3 py-3',
        default: 'gap-4 py-4',
        lg: 'gap-6 py-6',
      },
      clickable: {
        true: 'cursor-pointer hover:shadow-md',
        false: '',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      clickable: false,
      padding: 'default',
    },
  },
);

export const cardHeaderVariants = cva(
  'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'px-3 pb-2',
        default: 'px-4 pb-3',
        lg: 'px-6 pb-4',
      },
      border: {
        true: 'border-b pb-4',
        false: '',
      },
    },
    defaultVariants: {
      padding: 'default',
      border: false,
    },
  },
);

export const cardContentVariants = cva('', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'px-3',
      default: 'px-4',
      lg: 'px-6',
    },
  },
  defaultVariants: {
    padding: 'default',
  },
});

export const cardFooterVariants = cva('flex items-center', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'px-3 pt-2',
      default: 'px-4 pt-3',
      lg: 'px-6 pt-4',
    },
    border: {
      true: 'border-t pt-4',
      false: '',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: {
    padding: 'default',
    border: false,
    justify: 'start',
  },
});
