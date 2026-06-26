import Link from "next/link";
import {
  getSaldoAtual,
  listarMovimentosComSaldo,
} from "@/lib/actions/movimentoCaixa";
import { listarContasBancariasComSaldo } from "@/lib/actions/contasBancarias";
import { formatBRL } from "@/lib/format";
import MovimentosLista from "@/components/MovimentosLista";

export default async function CaixaPage() {
  const [movimentos, saldoAtual, contasBancarias] = await Promise.all([
    listarMovimentosComSaldo(),
    getSaldoAtual(),
    listarContasBancariasComSaldo(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-800">
          Movimento Diário de Caixa
        </h1>
        <Link
          href="/caixa/novo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {contasBancarias.map((c) => (
          <div key={c.id} className="rounded-lg bg-white p-3 shadow">
            <div className="text-xs text-zinc-500">{c.nome}</div>
            <div
              className={`text-lg font-semibold ${c.saldo >= 0 ? "text-zinc-800" : "text-red-700"}`}
            >
              {formatBRL(c.saldo)}
            </div>
            {c.cofrinhos.length > 0 && (
              <div className="mt-1 flex flex-col gap-0.5">
                {c.cofrinhos.map((cof) => (
                  <div key={cof.id} className="text-xs text-purple-700">
                    🐷 {cof.nome}: {formatBRL(cof.saldo)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="rounded-lg bg-zinc-900 p-3 shadow">
          <div className="text-xs text-zinc-300">Saldo Total</div>
          <div
            className={`text-lg font-semibold ${saldoAtual >= 0 ? "text-white" : "text-red-400"}`}
          >
            {formatBRL(saldoAtual)}
          </div>
        </div>
      </div>

      <MovimentosLista movimentos={movimentos} />
    </div>
  );
}
