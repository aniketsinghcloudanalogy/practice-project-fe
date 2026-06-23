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

      <div className="flex justify-between gap-3 rounded-xl  border border-slate-200 bg-white p-4 sm:p-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 px-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="m-0 truncate text-xl font-semibold text-slate-900">{stat.value}</p>
              <p className="m-0 truncate text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
