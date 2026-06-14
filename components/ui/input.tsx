import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, invalid, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div
          className={cn(
            "group relative flex h-10 w-full items-center rounded-lg border border-input bg-background/60 backdrop-blur-sm transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
            invalid && "border-destructive focus-within:ring-destructive/30",
            className,
          )}
        >
          {leftIcon ? (
            <span className="pointer-events-none flex h-full items-center pl-3 text-muted-foreground [&_svg]:size-4">
              {leftIcon}
            </span>
          ) : null}
          <input
            type={type}
            ref={ref}
            className="h-full w-full border-0 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none flex h-full items-center pr-3 text-muted-foreground [&_svg]:size-4">
              {rightIcon}
            </span>
          ) : null}
        </div>
      );
    }
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background/60 backdrop-blur-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-destructive focus:ring-destructive/30",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
