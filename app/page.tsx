import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-24 px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Fractions Mastery Tracker
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A misconception-targeted diagnostic for 3rd–4th grade fractions.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Dashboard</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Empty state — no learners yet. Start by creating one.
        </p>
        <Link
          href="/setup"
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white w-fit hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create a learner
        </Link>
      </section>
    </main>
  )
}
