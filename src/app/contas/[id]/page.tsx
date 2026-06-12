import { notFound } from "next/navigation";
import { getContaPagar } from "@/lib/actions/contasPagar";
import { listarCategorias } from "@/lib/actions/categorias";
import ContaForm from "@/components/ContaForm";
import { atualizarContaFormAction } from "../formActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarContaPage({ params }: PageProps) {
  const { id } = await params;
  const contaId = Number(id);

  const [conta, categorias] = await Promise.all([
    getContaPagar(contaId),
    listarCategorias("contas"),
  ]);

  if (!conta) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">Editar conta</h1>
      <ContaForm
        categorias={categorias.map((c) => c.nome)}
        conta={conta}
        action={atualizarContaFormAction.bind(null, contaId)}
      />
    </div>
  );
}
