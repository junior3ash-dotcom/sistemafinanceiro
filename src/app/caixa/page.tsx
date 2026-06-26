import Link from "next/link";
import {
  getSaldoAtual,
  listarMovimentosComSaldo,
} from "@/lib/actions/movimentoCaixa";
import { formatBRL } from "@/lib/format";
import MovimentosLista from "@/components/MovimentosLista";

export default async function CaixaPage() {
  const [movimentos, saldoAtual] = await Promise.all([
    listarMovimentosComSaldo(),
    getSaldoAtual(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">
            Movimento Diário de Caixa
          </h1>
          <p className="text-sm text-zinc-500">
            Saldo atual:{" "}
            <span
              className={`font-semibold ${
                saldoAtual >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatBRL(saldoAtual)}
            </span>
          </p>
        </div>
        <Link
          href="/caixa/novo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <MovimentosLista movimentos={movimentos} />
    </div>
  );
}
