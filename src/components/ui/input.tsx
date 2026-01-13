import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] md:text-sm",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "selection:bg-primary selection:text-primary-foreground",
        "!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600",
        "placeholder:!text-gray-400 dark:placeholder:!text-gray-500",
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
