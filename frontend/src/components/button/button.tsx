import type { ComponentPropsWithoutRef } from "react";

export function Button({
  children,
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return <button {...props}>{children}</button>;
}
