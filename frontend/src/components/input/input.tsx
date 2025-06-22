import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

export function Input({ type, name, ...props }: InputProps) {
  return <input type={type} name={name} {...props} />;
}
