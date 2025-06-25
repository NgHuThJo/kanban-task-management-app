import type { ComponentProps } from "react";
import type { GetKeys } from "#frontend/types/custom/custom";
import styles from "./input.module.css";

type ValidClassName = GetKeys<typeof styles>;
type InputProps = Omit<ComponentProps<"input">, "className"> & {
  className?: ValidClassName;
};

export function Input({ className, type, name, ...props }: InputProps) {
  return (
    <input
      className={className ? styles[className] : undefined}
      type={type}
      name={name}
      {...props}
    />
  );
}
