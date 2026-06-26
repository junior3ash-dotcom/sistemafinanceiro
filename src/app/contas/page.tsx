import Link from "next/link";
import { listarContasMesVigenteEVencidas, listarContasPagar } from "@/lib/actions/contasPagar";
import { listarCategorias } from "@/lib/actions/categorias";
import { getResumoMesVigente } from "@/lib/actions/dashboard";
import { ENTIDADES, PRIORIDADES, TIPOS_CONTA } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import ContasLista from "@/components/ContasLista";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    categoria?: string;
    entidade?: string;
    tipo?: string;
    prioridade?: string;
    periodo?: string;
  }>;
}

export default async function ContasPage({ searchParams }: PageProps) {
  const filtros = await searchParams;
  const verTodosMeses = filtros.periodo === "todos";

  const filtrosLista = {
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
  };

  const [contas, categorias, resumo] = await Promise.all([
    verTodosMeses
      ? listarContasPagar(filtrosLista)
      : listarContasMesVigenteEVencidas(filtrosLista),
    listarCategorias("contas"),
    getResumoMesVigente(),
  ]);

  const percentSaldoNecessario =
    resumo.valorNecessario > 0
      ? Math.min(100, Math.round((resumo.saldoCaixa / resumo.valorNecessario) * 100))
      : 100;
  const saldoSuficiente = resumo.saldoCaixa >= resumo.valorNecessario;

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

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg bg-white p-3 shadow">
          <div className="text-xs text-zinc-500">Total do Mês</div>
          <div className="text-lg font-semibold text-zinc-800">{formatBRL(resumo.totalMes)}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow">
          <div className="text-xs text-zinc-500">Pago</div>
          <div className="text-lg font-semibold text-green-700">{formatBRL(resumo.pago)}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow">
          <div className="text-xs text-zinc-500">Restante</div>
          <div className="text-lg font-semibold text-amber-700">{formatBRL(resumo.restante)}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow">
          <div className="text-xs text-zinc-500">Dias no Mês</div>
          <div className="text-lg font-semibold text-zinc-800">{resumo.diasRestantesMes}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow">
          <div className="text-xs text-zinc-500">% Pago</div>
          <div className="text-lg font-semibold text-zinc-800">{resumo.percentPago}%</div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-green-500"
              style={{ width: `${resumo.percentPago}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow">
          <div className="text-xs text-zinc-500">Saldo Caixa</div>
          <div
            className={`text-lg font-semibold ${resumo.saldoCaixa >= 0 ? "text-green-700" : "text-red-700"}`}
          >
            {formatBRL(resumo.saldoCaixa)}
          </div>
        </div>
      </div>

      {resumo.qtdVencidas > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <span className="font-semibold">
              {resumo.qtdVencidas} {resumo.qtdVencidas === 1 ? "conta vencida" : "contas vencidas"}
            </span>
            <span>· Total: {formatBRL(resumo.totalVencidas)}</span>
          </div>
          <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
            URGENTE
          </span>
        </div>
      )}

      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-zinc-800">
            Saldo em caixa x Necessário para pagar tudo
          </span>
          <span className={saldoSuficiente ? "text-green-700" : "text-red-700"}>
            {formatBRL(resumo.saldoCaixa)} / {formatBRL(resumo.valorNecessario)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-zinc-100">
          <div
            className={`h-3 rounded-full ${saldoSuficiente ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${percentSaldoNecessario}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {saldoSuficiente
            ? "Você tem saldo suficiente para cobrir as contas do mês e as vencidas."
            : `Faltam ${formatBRL(resumo.valorNecessario - resumo.saldoCaixa)} para cobrir tudo.`}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-white p-2 shadow">
        <span className="text-sm text-zinc-500">
          {verTodosMeses
            ? "Mostrando contas de todos os meses"
            : "Mostrando contas do mês vigente + vencidas"}
        </span>
        <Link
          href={verTodosMeses ? "/contas" : "/contas?periodo=todos"}
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
        >
          {verTodosMeses ? "Ver só mês vigente + vencidas" : "Ver todos os meses"}
        </Link>
      </div>

      <form className="grid grid-cols-2 gap-2 rounded-lg bg-white p-3 shadow sm:grid-cols-5" method="get">
        <input type="hidden" name="periodo" value={filtros.periodo ?? ""} />
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

      <ContasLista contas={contas} />
    </div>
  );
}
