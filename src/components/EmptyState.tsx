export function EmptyState({ title, line }: { title: string; line: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-3xl">{title}</h1>
      <p className="mt-2 text-muted">{line}</p>
    </div>
  )
}
