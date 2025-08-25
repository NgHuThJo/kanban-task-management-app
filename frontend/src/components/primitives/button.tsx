import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#frontend/lib/utils";
import styles from "./button.module.css";

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      ghost: styles.ghost,
      link: styles.link,
      cancel: styles.cancel,
      select: styles.select,
      sidebar: styles.sidebar,
    },
    size: {
      default: styles["default-size"],
      sm: styles.sm,
      lg: styles.lg,
      icon: styles.icon,
      select: styles["select-size"],
      sidebar: styles["sidebar-size"],
    },
    intent: {
      default: "",
      destructive: "",
      create: "",
      active: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    intent: "default",
  },
  compoundVariants: [
    {
      variant: "default",
      intent: "destructive",
      className: styles["destructive-default"],
    },
    {
      variant: "link",
      intent: "destructive",
      className: styles["destructive-link"],
    },
    {
      variant: "sidebar",
      intent: "create",
      className: styles["create-sidebar"],
    },
    {
      variant: "sidebar",
      intent: "active",
      className: styles["active-sidebar"],
    },
  ],
});

export function Button({
  className,
  variant,
  size,
  intent,
  type = "button",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size, intent, className }))}
      {...props}
    />
  );
}
