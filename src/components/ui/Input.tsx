import * as React from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "./CopyButton"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  enableCopy?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, iconRight, iconLeft, enableCopy = false, value, defaultValue, ...props }, ref) => {
    const stringValue = (value !== undefined ? String(value) : (defaultValue !== undefined ? String(defaultValue) : '')).trim();

    return (
      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div className="absolute left-3 flex items-center justify-center text-zinc-400 pointer-events-none">
            {iconLeft}
          </div>
        )}
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-violet-400 transition-all duration-200",
            (iconRight || (enableCopy && stringValue)) && "pr-10",
            iconLeft && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {enableCopy && stringValue ? (
          <div className="absolute right-2 flex items-center justify-center">
            <CopyButton value={stringValue} />
          </div>
        ) : iconRight ? (
          <div className="absolute right-3 flex items-center justify-center text-zinc-500 pointer-events-none">
            {iconRight}
          </div>
        ) : null}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
