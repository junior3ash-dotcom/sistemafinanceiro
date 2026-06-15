import { Periodo } from "@/lib/dates";

interface ExportacoesSectionProps {
  periodoAtual: Periodo;
}

export default function ExportacoesSection({
  periodoAtual,
}: ExportacoesSectionProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-1 text-base font-semibold text-zinc-800">
        Exportar dados
      </h2>
      <p className="mb-3 text-sm text-zinc-500">
        Gera um arquivo CSV (abre direto no Excel) para baixar no seu
        dispositivo. Deixe as datas em branco para exportar tudo.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <form
          action="/api/export/contas"
          method="get"
          className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3"
        >
          <span className="text-sm font-medium text-zinc-700">
            Contas a Pagar
          </span>
          <span className="text-xs text-zinc-500">
            Todas as contas (inclui pagas). Filtro opcional por vencimento.
          </span>
          <label className="text-xs text-zinc-600">
            De
            <input
              type="date"
              name="inicio"
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Até
            <input
              type="date"
              name="fim"
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Exportar CSV
          </button>
        </form>

        <form
          action="/api/export/caixa"
          method="get"
          className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3"
        >
          <span className="text-sm font-medium text-zinc-700">
            Movimento de Caixa
          </span>
          <span className="text-xs text-zinc-500">
            Todos os lançamentos. Filtro opcional por data.
          </span>
          <label className="text-xs text-zinc-600">
            De
            <input
              type="date"
              name="inicio"
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Até
            <input
              type="date"
              name="fim"
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Exportar CSV
          </button>
        </form>

        <form
          action="/api/export/resumo"
          method="get"
          className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3"
        >
          <span className="text-sm font-medium text-zinc-700">
            Resumo do Período
          </span>
          <span className="text-xs text-zinc-500">
            Totais de entradas, saídas e saídas por categoria no período.
          </span>
          <label className="text-xs text-zinc-600">
            De
            <input
              type="date"
              name="inicio"
              defaultValue={periodoAtual.inicio}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Até
            <input
              type="date"
              name="fim"
              defaultValue={periodoAtual.fim}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Exportar CSV
          </button>
        </form>
      </div>
    </div>
  );
}
