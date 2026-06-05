"use client";

import { useAppSelector } from '@/store/hooks'

const Page = () => {
  const dashboard = useAppSelector((state) => state.dashboard)
  const {
    summaryCards,
    ticketsData,
    updatesData,
  } = dashboard

  return (
    <section className="mx-auto flex w-full max-w-full flex-1 flex-col gap-6 px-px pb-6 pt-0 sm:px-2 lg:px-3 lg:pb-8 xl:max-w-7xl">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_45%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 shadow-sm shadow-slate-200/60 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Sales, users, and activity in one view.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            This dashboard now uses chart visuals similar to the screenshot: a main dual-line revenue chart, sparkline metric cards, and circular download progress.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">{card.title}</p>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{card.amount}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{card.subtitle}</p>
              </div>

              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{ backgroundColor: card.color }}
                aria-hidden="true"
              >
                <span className="text-sm font-semibold">{card.title.slice(0, 1)}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Charts removed - implementation deleted */}

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Support Tickets</h2>
              <p className="mt-1 text-sm text-slate-500">Recent customer issues and follow-ups.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">2026</span>
          </div>

          <div className="mt-4 space-y-3">
            {ticketsData.map((ticket) => (
              <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-950">{ticket.name}</p>
                  <p className="text-xs text-slate-500">{ticket.project} · {ticket.location}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{ticket.date}</p>
                  <p>{ticket.time}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <h2 className="text-lg font-semibold text-slate-950">Recent Updates</h2>
          <div className="mt-4 space-y-4">
            {updatesData.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">{item.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

    </section>
  )
}

export default Page
