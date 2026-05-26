const Page = () => {
  return (
    <main className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Welcome to your dashboard. The layout now keeps a consistent gutter on
          larger screens so the content feels centered instead of floating in
          the corner.
        </p>
      </section>    
    </main>
  )
}

export default Page