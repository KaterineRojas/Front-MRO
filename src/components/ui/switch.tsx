"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);

  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleChange = (newChecked: boolean) => {
    console.log('🔘 Switch clicked! New state:', newChecked ? 'ON ✅' : 'OFF ❌');
    setIsChecked(newChecked);
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };

  const backgroundColor = isChecked ? '#10b981' : '#9ca3af';
  const thumbPosition = isChecked ? '24px' : '2px';

  console.log('🔍 Switch render - isChecked:', isChecked, 'backgroundColor:', backgroundColor);

  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={isChecked}
      onCheckedChange={handleChange}
      style={{
        width: '52px',
        height: '28px',
        backgroundColor: backgroundColor,
        borderRadius: '14px',
        position: 'relative',
        border: '2px solid #374151',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: '2px',
        boxShadow: isChecked ? '0 0 0 3px rgba(16, 185, 129, 0.3)' : 'none',
        outline: 'none',
      }}
      className={className}
      {...props}
    >
      <SwitchPrimitive.Thumb
        style={{
          display: 'block',
          width: '20px',
          height: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          transition: 'transform 0.3s ease',
          transform: `translateX(${thumbPosition})`,
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.4)',
          border: '1px solid #e5e7eb',
        }}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

export { Switch };
