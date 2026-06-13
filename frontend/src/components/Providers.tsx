"use client";

import { ReactNode } from "react";
import { DeskProvider } from "../context/DeskContext";

export function Providers({ children }: { children: ReactNode }) {
  return <DeskProvider>{children}</DeskProvider>;
}
