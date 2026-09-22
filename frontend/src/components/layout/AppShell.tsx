import type { ReactNode } from "react";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Header />

      {/* The header is sticky, so content only needs breathing room below it. */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-faint sm:flex-row sm:px-6">
          <p>
            Drop links expire automatically — files are deleted once they do.
          </p>
          <p className="font-mono">dropctl</p>
        </div>
      </footer>
    </div>
  );
}
