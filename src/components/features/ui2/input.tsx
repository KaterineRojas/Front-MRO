import * as React from "react";

import { cn } from "./utils";


function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "bg-background dark:bg-gray-800 text-foreground dark:text-white",
        "border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base",
        "transition-[color,box-shadow] outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "[&:-webkit-autofill]:!shadow-[0_0_0_30px_white_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_30px_rgb(17,24,39)_inset]",
        "[&:-webkit-autofill]:!text-gray-900 dark:[&:-webkit-autofill]:!text-white",
        "[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
