import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base outline-none transition-[color,box-shadow] resize-none md:text-sm",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600",
        "placeholder:!text-gray-400 dark:placeholder:!text-gray-500",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
