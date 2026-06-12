import Link from "next/link";
import { listarContasPagar } from "@/lib/actions/contasPagar";
import { listarCategorias } from "@/lib/actions/categorias";
import { ENTIDADES, PRIORIDADES, TIPOS_CONTA } from "@/lib/constants";
import { formatBRL, formatDateBR } from "@/lib/format";
import { getStatusExibicao } from "@/lib/statusConta";
import StatusBadge from "@/components/StatusBadge";
import ContaAcoes from "@/components/ContaAcoes";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    categoria?: string;
    entidade?: string;
    tipo?: string;
    prioridade?: string;
  }>;
}

export default async function ContasPage({ searchParams }: PageProps) {
  const filtros = await searchParams;

  const [contas, categorias] = await Promise.all([
    listarContasPagar({
      status: filtros.status as
        | "Vencido"
        | "Pendente"
        | "Pago"
        | "Abertas"
        | undefined,
      categoria: filtros.categoria,
      entidade: filtros.entidade,
      tipo: filtros.tipo,
      prioridade: filtros.prioridade,
    }),
    listarCategorias("contas"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-800">Contas a Pagar</h1>
        <Link
          href="/contas/nova"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nova conta
        </Link>
      </div>

      <form className="grid grid-cols-2 gap-2 rounded-lg bg-white p-3 shadow sm:grid-cols-5" method="get">
        <select
          name="status"
          defaultValue={filtros.status ?? "Abertas"}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="Abertas">Abertas (Vencido + Pendente)</option>
          <option value="Vencido">Vencido</option>
          <option value="Pendente">Pendente</option>
          <option value="Pago">Pago</option>
          <option value="">Todas</option>
        </select>

        <select
          name="categoria"
          defaultValue={filtros.categoria ?? ""}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Todas categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          name="entidade"
          defaultValue={filtros.entidade ?? ""}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Todos CNPJ/PF</option>
          {ENTIDADES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          name="tipo"
          defaultValue={filtros.tipo ?? ""}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Operacional/Não operacional</option>
          {TIPOS_CONTA.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          name="prioridade"
          defaultValue={filtros.prioridade ?? ""}
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Todas prioridades</option>
          {PRIORIDADES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="col-span-2 rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 sm:col-span-5"
        >
          Filtrar
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {contas.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-center text-sm text-zinc-500 shadow">
            Nenhuma conta encontrada para esse filtro.
          </p>
        )}

        {contas.map((conta) => {
          const status = getStatusExibicao(conta);
          const parcelaLabel = conta.parcelas_total
            ? ` (${conta.parcela_atual}/${conta.parcelas_total})`
            : "";
          return (
            <div
              key={conta.id}
              className="flex flex-col gap-2 rounded-lg bg-white p-3 shadow sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="font-medium text-zinc-800">
                    {conta.descricao}
                    {parcelaLabel}
                  </span>
                </div>
                <div className="text-sm text-zinc-500">
                  {conta.categoria} · {conta.entidade} ·{" "}
                  {formatDateBR(conta.vencimento)} ·{" "}
                  <span className="font-semibold text-zinc-700">
                    {formatBRL(conta.valor)}
                  </span>
                </div>
              </div>
              <ContaAcoes id={conta.id} status={conta.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
