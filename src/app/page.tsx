import {
  getResumoContasPorCategoria,
  getResumoPeriodo,
} from "@/lib/actions/dashboard";
import { getPeriodo, TipoPeriodo } from "@/lib/dates";
import { formatBRL, formatDateBR } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{
    periodo?: string;
    inicio?: string;
    fim?: string;
  }>;
}

const OPCOES_PERIODO: { value: TipoPeriodo; label: string }[] = [
  { value: "semana", label: "Semana atual" },
  { value: "quinzena", label: "Quinzena atual" },
  { value: "mes", label: "Mês atual" },
  { value: "personalizado", label: "Personalizado" },
];

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tipoPeriodo = (params.periodo as TipoPeriodo) ?? "quinzena";

  const periodo = getPeriodo(
    tipoPeriodo,
    undefined,
    tipoPeriodo === "personalizado" && params.inicio && params.fim
      ? { inicio: params.inicio, fim: params.fim }
      : undefined
  );

  const [resumo, resumoContas] = await Promise.all([
    getResumoPeriodo(periodo),
    getResumoContasPorCategoria(),
  ]);

  const maiorSaida = Math.max(
    1,
    ...resumo.saidasPorCategoria.map((s) => s.valor)
  );

  const totalVencido = resumoContas.reduce((acc, r) => acc + r.vencido, 0);
  const totalPendente = resumoContas.reduce((acc, r) => acc + r.pendente, 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">Resumo</h1>

      <form className="flex flex-wrap items-end gap-2 rounded-lg bg-white p-3 shadow" method="get">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Período</label>
          <select
            name="periodo"
            defaultValue={tipoPeriodo}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          >
            {OPCOES_PERIODO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {tipoPeriodo === "personalizado" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">De</label>
              <input
                type="date"
                name="inicio"
                defaultValue={params.inicio ?? periodo.inicio}
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">Até</label>
              <input
                type="date"
                name="fim"
                defaultValue={params.fim ?? periodo.fim}
                className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Aplicar
        </button>

        <span className="ml-auto self-center text-sm text-zinc-500">
          {formatDateBR(periodo.inicio)} a {formatDateBR(periodo.fim)}
        </span>
      </form>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-zinc-500">Entradas no período</div>
          <div className="text-2xl font-semibold text-green-700">
            {formatBRL(resumo.totalEntradas)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-zinc-500">Saídas no período</div>
          <div className="text-2xl font-semibold text-red-700">
            {formatBRL(resumo.totalSaidas)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-zinc-500">Saldo do período</div>
          <div
            className={`text-2xl font-semibold ${
              resumo.saldoPeriodo >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatBRL(resumo.saldoPeriodo)}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-base font-semibold text-zinc-800">
          Saídas por categoria no período
        </h2>
        {resumo.saidasPorCategoria.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma saída no período.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {resumo.saidasPorCategoria.map((s) => (
              <div key={s.categoria} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700">{s.categoria}</span>
                  <span className="font-medium text-zinc-800">
                    {formatBRL(s.valor)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-red-400"
                    style={{ width: `${(s.valor / maiorSaida) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-base font-semibold text-zinc-800">
          Contas a pagar por categoria (em aberto)
        </h2>
        {resumoContas.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma conta em aberto.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="py-1.5 pr-2">Categoria</th>
                  <th className="px-2 py-1.5 text-right text-red-600">Vencido</th>
                  <th className="px-2 py-1.5 text-right text-yellow-700">Pendente</th>
                  <th className="py-1.5 pl-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {resumoContas.map((r) => (
                  <tr key={r.categoria} className="border-b border-zinc-100">
                    <td className="py-1.5 pr-2 text-zinc-700">{r.categoria}</td>
                    <td className="px-2 py-1.5 text-right text-red-600">
                      {r.vencido > 0 ? formatBRL(r.vencido) : "-"}
                    </td>
                    <td className="px-2 py-1.5 text-right text-yellow-700">
                      {r.pendente > 0 ? formatBRL(r.pendente) : "-"}
                    </td>
                    <td className="py-1.5 pl-2 text-right font-medium text-zinc-800">
                      {formatBRL(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-zinc-800">
                  <td className="py-1.5 pr-2">Total geral</td>
                  <td className="px-2 py-1.5 text-right text-red-600">
                    {formatBRL(totalVencido)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-yellow-700">
                    {formatBRL(totalPendente)}
                  </td>
                  <td className="py-1.5 pl-2 text-right">
                    {formatBRL(totalVencido + totalPendente)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
