import { listarCategorias, listarCategoriasMovimento } from "@/lib/actions/categorias";
import { getSaldoInicial } from "@/lib/actions/configuracoes";
import CategoriaLista from "@/components/CategoriaLista";
import CategoriaMovimentoLista from "@/components/CategoriaMovimentoLista";
import SaldoInicialForm from "@/components/SaldoInicialForm";
import ExportacoesSection from "@/components/ExportacoesSection";
import ImportacaoSection from "@/components/ImportacaoSection";
import { getPeriodo } from "@/lib/dates";

export default async function ConfiguracoesPage() {
  const [categoriasContas, categoriasMovimento, saldoInicial] = await Promise.all([
    listarCategorias("contas"),
    listarCategoriasMovimento(),
    getSaldoInicial(),
  ]);

  const periodoAtual = getPeriodo("quinzena");

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
            Cada categoria pertence a Entrada ou Saída e aparece apenas no
            tipo correspondente ao lançar um movimento. Clique em
            &quot;Subcategorias&quot; para gerenciar as subcategorias de cada uma.
          </p>
          <CategoriaMovimentoLista categorias={categoriasMovimento} />
        </div>
      </div>

      <ExportacoesSection periodoAtual={periodoAtual} />
      <ImportacaoSection />
    </div>
  );
}
