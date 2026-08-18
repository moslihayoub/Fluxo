"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

interface SwitchProps extends SwitchPrimitive.Root.Props {
  variant?: "default" | "pro"
}

function Switch({
  className,
  variant = "default",
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-white dark:ring-offset-zinc-950",
        variant === "pro"
          ? "data-checked:bg-violet-600 data-unchecked:bg-zinc-200 dark:data-unchecked:bg-zinc-800 focus-visible:ring-violet-500"
          : "data-checked:bg-zinc-900 dark:data-checked:bg-white data-unchecked:bg-zinc-200 dark:data-unchecked:bg-zinc-800 focus-visible:ring-zinc-900 dark:focus-visible:ring-white",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0",
          variant === "default" && "dark:data-checked:bg-zinc-900"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
