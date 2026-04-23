export default async function AssessPage(props: PageProps<'/assess/[id]'>) {
  const { id } = await props.params

  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-24 px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Assessment</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Assessment session <code className="font-mono text-sm">{id}</code>
        </p>
      </header>

      <section className="text-sm text-zinc-500 dark:text-zinc-400">
        Problem-by-problem UI goes here — wired Friday morning (Day 2).
      </section>
    </main>
  )
}
