import { listarCategoriasMovimento } from "@/lib/actions/categorias";
import { listarContasParaVinculo } from "@/lib/actions/movimentoCaixa";
import { listarContasBancariasComSaldo } from "@/lib/actions/contasBancarias";
import MovimentoForm from "@/components/MovimentoForm";
import { criarMovimentoFormAction } from "../formActions";

export default async function NovoMovimentoPage() {
  const [categorias, contasPendentes, contasBancarias] = await Promise.all([
    listarCategoriasMovimento(),
    listarContasParaVinculo(),
    listarContasBancariasComSaldo(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">Novo lançamento</h1>
      <MovimentoForm
        categorias={categorias}
        contasPendentes={contasPendentes}
        contasBancarias={contasBancarias}
        action={criarMovimentoFormAction}
      />
    </div>
  );
}
