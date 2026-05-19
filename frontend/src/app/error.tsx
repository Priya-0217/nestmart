"use client";

import Link from "next/link";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center gap-5 px-4 py-12 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Something Went Wrong</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
        We hit an unexpected error.
      </h1>
      <p className="text-sm leading-7 text-slate-600 md:text-base">{error.message || "Please try again."}</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Back To Home
        </Link>
      </div>
    </main>
  );
}
