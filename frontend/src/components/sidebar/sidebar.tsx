import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "#frontend/components/icon/icon";

export function Sidebar() {
  return (
    <aside>
      <Logo />
      <div>
        <h2></h2>
        <ul>
          <li></li>
        </ul>
      </div>
    </aside>
  );
}
