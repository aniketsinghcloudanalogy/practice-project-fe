import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Form Builder",
  description: "Form builder for creating dynamic forms",
};

export default function FormBuilderLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
