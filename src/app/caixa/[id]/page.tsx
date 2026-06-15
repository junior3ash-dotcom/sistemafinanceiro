import { notFound } from "next/navigation";
import { getMovimento, listarContasParaVinculo } from "@/lib/actions/movimentoCaixa";
import { listarCategoriasMovimento } from "@/lib/actions/categorias";
import MovimentoForm from "@/components/MovimentoForm";
import { atualizarMovimentoFormAction } from "../formActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMovimentoPage({ params }: PageProps) {
  const { id } = await params;
  const movimentoId = Number(id);

  const [movimento, categorias, contasPendentes] = await Promise.all([
    getMovimento(movimentoId),
    listarCategoriasMovimento(),
    listarContasParaVinculo(),
  ]);

  if (!movimento) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">Editar lançamento</h1>
      <MovimentoForm
        categorias={categorias}
        contasPendentes={contasPendentes}
        movimento={movimento}
        action={atualizarMovimentoFormAction.bind(null, movimentoId)}
      />
    </div>
  );
}
