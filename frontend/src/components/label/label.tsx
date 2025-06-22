import type { ComponentProps } from "react";

type LabelProps = ComponentProps<"label">;

export function Label({ children, htmlFor, ...props }: LabelProps) {
  return (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  );
}
