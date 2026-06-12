import { listarCategorias } from "@/lib/actions/categorias";
import { getSaldoInicial } from "@/lib/actions/configuracoes";
import CategoriaLista from "@/components/CategoriaLista";
import SaldoInicialForm from "@/components/SaldoInicialForm";

export default async function ConfiguracoesPage() {
  const [categoriasContas, categoriasMovimento, saldoInicial] = await Promise.all([
    listarCategorias("contas"),
    listarCategorias("movimento"),
    getSaldoInicial(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-800">Configurações</h1>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-base font-semibold text-zinc-800">Saldo inicial</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Usado como ponto de partida para o saldo acumulado do caixa. Defina
          apenas uma vez.
        </p>
        <SaldoInicialForm saldoInicial={saldoInicial} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-1 text-base font-semibold text-zinc-800">
            Categorias - Contas a Pagar
          </h2>
          <p className="mb-3 text-sm text-zinc-500">
            Usadas no cadastro de contas a pagar.
          </p>
          <CategoriaLista tipo="contas" categorias={categoriasContas} />
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-1 text-base font-semibold text-zinc-800">
            Categorias - Movimento de Caixa
          </h2>
          <p className="mb-3 text-sm text-zinc-500">
            Usadas nos lançamentos do caixa (entradas e saídas), para DRE.
          </p>
          <CategoriaLista tipo="movimento" categorias={categoriasMovimento} />
        </div>
      </div>
    </div>
  );
}
