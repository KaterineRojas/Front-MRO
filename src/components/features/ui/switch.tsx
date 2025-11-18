"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);

  React.useEffect(() => {
    console.log('🔄 Switch prop changed, checked:', checked);
    setIsChecked(checked || false);
  }, [checked]);

  const handleChange = (newChecked: boolean) => {
    console.log('🔘 Switch clicked! Old:', isChecked, '→ New:', newChecked);
    setIsChecked(newChecked);
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };

  const backgroundColor = isChecked ? '#10b981' : '#9ca3af';
  const thumbPosition = isChecked ? '18px' : '2px';

  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={isChecked}
      onCheckedChange={handleChange}
      style={{
        width: '40px',
        height: '22px',
        backgroundColor: backgroundColor,
        borderRadius: '11px',
        position: 'relative',
        border: '2px solid #374151',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: '2px',
        boxShadow: isChecked ? '0 0 0 2px rgba(16, 185, 129, 0.3)' : 'none',
        outline: 'none',
      }}
      className={className}
      {...props}
    >
      <SwitchPrimitive.Thumb
        style={{
          display: 'block',
          width: '14px',
          height: '14px',
          backgroundColor: '#ffffff',
          borderRadius: '7px',
          transition: 'transform 0.3s ease',
          transform: `translateX(${thumbPosition})`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
          border: '1px solid #e5e7eb',
        }}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

export { Switch };
