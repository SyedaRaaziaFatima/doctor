import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-teal-600 text-white hover:bg-teal-700"
          : "border border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-700"
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "teal" | "amber" | "red" | "slate" }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200"
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1", tones[tone])}>
      {children}
    </span>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 transition focus:ring-4"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  required,
  placeholder,
  defaultValue
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={4}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-teal-500/20 transition focus:ring-4"
      />
    </label>
  );
}
