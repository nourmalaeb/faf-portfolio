// your-tooltip.jsx
import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import './tooltip.css';

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}) {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        side="top"
        align="center"
        className="TooltipContent"
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow
          width={11}
          height={5}
          className="TooltipArrow"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}
