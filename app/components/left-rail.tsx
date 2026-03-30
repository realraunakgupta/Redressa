import Link from "next/link";

export function LeftRail({ activePath }: { activePath: "new" | "case" | "workspace" }) {
  const isCase = activePath === "case";

  return (
    <aside className="hidden w-64 flex-col border-r border-neutral-800 bg-neutral-900/30 px-4 py-6 md:flex">
      <div className="flex-1 space-y-8">
        {/* Workspace Section */}
        <div>
          <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Workspace
          </h3>
          <div className="mt-3 space-y-1">
            <Link
              href="/new"
              className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                activePath === "new"
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Claim
            </Link>
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                activePath === "workspace"
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Recent Cases
            </Link>
          </div>
        </div>

        {/* Workflow Section */}
        <div>
          <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Workflow
          </h3>
          <div className="mt-3 space-y-1">
            {isCase ? (
              <a href="#documents" className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 cursor-not-allowed">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </div>
            )}

            {isCase ? (
              <a href="#extraction" className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Extraction
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 cursor-not-allowed">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Extraction
              </div>
            )}

            {isCase ? (
              <a href="#outputs" className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-white bg-neutral-800/80 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Case Outputs
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 cursor-not-allowed">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Case Outputs
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="border-t border-neutral-800 pt-4 px-2">
         <div className="flex items-center gap-3 text-sm font-medium text-neutral-400">
            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white text-xs font-bold">A</div>
            <span>Analyst Console</span>
         </div>
      </div>
    </aside>
  );
}
