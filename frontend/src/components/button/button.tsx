import type { ComponentPropsWithoutRef } from "react";
import styles from "./button.module.css";

type ValidClassName = keyof typeof styles;
type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "className"> & {
  className?: ValidClassName;
};

export function Button({
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={className ? styles[className] : undefined}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
