export default async function CasePage(props: PageProps<"/case/[id]">) {
  const { id } = await props.params;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Case Header */}
        <div className="mb-8">
          <p className="text-sm text-neutral-500">Case</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-50">
            {id === "new" ? "New Claim" : `Case #${id}`}
          </h1>
        </div>

        {/* Placeholder panels - will be replaced with real components */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            <PlaceholderPanel title="Complaint Intake" />
            <PlaceholderPanel title="Extracted Facts" />
            <PlaceholderPanel title="Generated Outputs" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PlaceholderPanel title="Agent Activity" />
            <PlaceholderPanel title="Citations" />
            <PlaceholderPanel title="Escalation Route" />
          </div>
        </div>
      </div>
    </main>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h2>
      <p className="mt-3 text-sm text-neutral-600">
        Placeholder - will be connected in a later build step.
      </p>
    </div>
  );
}
