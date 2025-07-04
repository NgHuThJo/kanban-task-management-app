import type { ComponentPropsWithRef } from "react";
import styles from "./dialog.module.css";

type DialogProps = ComponentPropsWithRef<"dialog">;

export function Dialog({ children, className, ref, ...props }: DialogProps) {
  return (
    <dialog
      className={className ? styles[className] : undefined}
      ref={ref}
      {...props}
    >
      {children}
    </dialog>
  );
}
