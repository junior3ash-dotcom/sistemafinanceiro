import { listarProximos15Dias } from "@/lib/actions/contasPagar";
import { formatBRL, formatDateBR } from "@/lib/format";
import { getStatusExibicao } from "@/lib/statusConta";
import StatusBadge from "@/components/StatusBadge";
import ContaAcoes from "@/components/ContaAcoes";

export default async function ProximosPage() {
  const contas = await listarProximos15Dias();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">
        Próximos 15 dias
      </h1>
      <p className="text-sm text-zinc-500">
        Tudo que está vencido ou vence nos próximos 15 dias, ordenado por
        data.
      </p>

      <div className="flex flex-col gap-2">
        {contas.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-center text-sm text-zinc-500 shadow">
            Nada vencido ou vencendo nos próximos 15 dias. 🎉
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
                  <span
                    className={
                      status === "Vencido"
                        ? "font-semibold text-red-600"
                        : "font-semibold text-zinc-700"
                    }
                  >
                    {formatDateBR(conta.vencimento)}
                  </span>{" "}
                  ·{" "}
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
