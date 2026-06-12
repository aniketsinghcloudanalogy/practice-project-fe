import { Fragment } from "react";
import { partnerStats } from "./partner";

type PartnerStatsProps = {
  partnerCount: number;
  totalPrograms: number;
  pending: number;
};

export default function PartnerStats({ partnerCount, totalPrograms, pending }: PartnerStatsProps) {
  const stats = [
    { ...partnerStats[0], value: partnerCount },
    { ...partnerStats[1], value: totalPrograms },
    { ...partnerStats[2], value: pending },
    { ...partnerStats[3] },
  ];

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Partner Management</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {stats.map((stat, i) => (
            <Fragment key={stat.label}>
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="m-0 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="m-0 text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
              {i < stats.length - 1 && (
                <div className="hidden h-12 w-px bg-slate-200 lg:block" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
