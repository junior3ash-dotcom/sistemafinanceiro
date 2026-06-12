import { listarCategorias } from "@/lib/actions/categorias";
import ContaForm from "@/components/ContaForm";
import { criarContaFormAction } from "../formActions";

export default async function NovaContaPage() {
  const categorias = await listarCategorias("contas");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">Nova conta a pagar</h1>
      <ContaForm
        categorias={categorias.map((c) => c.nome)}
        action={criarContaFormAction}
      />
    </div>
  );
}
