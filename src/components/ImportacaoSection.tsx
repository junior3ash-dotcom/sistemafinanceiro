"use client";

import { useState, useTransition } from "react";
import {
  validarImportacaoContas,
  confirmarImportacaoContas,
  validarImportacaoCaixa,
  confirmarImportacaoCaixa,
  ResultadoValidacao,
} from "@/lib/actions/importacao";

type Modulo = "contas" | "caixa";

export default function ImportacaoSection() {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-1 text-base font-semibold text-zinc-800">
        Importar dados
      </h2>
      <p className="mb-3 text-sm text-zinc-500">
        Baixe o modelo, preencha com seus dados (sem alterar os cabeçalhos da
        primeira linha) e envie o arquivo CSV para importar.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImportCard
          modulo="contas"
          titulo="Contas a Pagar"
          templateUrl="/api/import/template/contas"
        />
        <ImportCard
          modulo="caixa"
          titulo="Movimento Diário de Caixa"
          templateUrl="/api/import/template/caixa"
        />
      </div>
    </div>
  );
}

interface ImportCardProps {
  modulo: Modulo;
  titulo: string;
  templateUrl: string;
}

function ImportCard({ modulo, titulo, templateUrl }: ImportCardProps) {
  const [resultado, setResultado] = useState<ResultadoValidacao<unknown> | null>(
    null
  );
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMensagem(null);
    setErroLeitura(null);
    setResultado(null);

    const reader = new FileReader();
    reader.onload = () => {
      const texto = String(reader.result ?? "");
      startTransition(async () => {
        try {
          const r =
            modulo === "contas"
              ? await validarImportacaoContas(texto)
              : await validarImportacaoCaixa(texto);
          setResultado(r as ResultadoValidacao<unknown>);
        } catch {
          setErroLeitura("Não foi possível ler o arquivo. Verifique se é um CSV válido.");
        }
      });
    };
    reader.readAsText(file, "UTF-8");

    // permite selecionar o mesmo arquivo de novo depois
    e.target.value = "";
  }

  function handleConfirmar() {
    if (!resultado) return;
    const itens = resultado.validas.map((v) => v.dados);

    startTransition(async () => {
      const r =
        modulo === "contas"
          ? await confirmarImportacaoContas(itens as never)
          : await confirmarImportacaoCaixa(itens as never);
      setMensagem(`${r.criadas} registro(s) importado(s) com sucesso.`);
      setResultado(null);
    });
  }

  function handleCancelar() {
    setResultado(null);
    setMensagem(null);
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3">
      <span className="text-sm font-medium text-zinc-700">{titulo}</span>

      <a
        href={templateUrl}
        className="text-xs font-medium text-blue-600 underline hover:text-blue-700"
      >
        Baixar modelo de importação
      </a>

      <label className="mt-1 text-xs text-zinc-600">
        Importar planilha (CSV)
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="mt-1 block w-full text-xs text-zinc-600"
        />
      </label>

      {pending && <p className="text-xs text-zinc-500">Processando...</p>}
      {erroLeitura && <p className="text-xs text-red-600">{erroLeitura}</p>}

      {resultado && (
        <div className="mt-2 rounded-md bg-zinc-50 p-2 text-xs">
          <p className="font-medium text-zinc-700">
            {resultado.total} registro(s) no arquivo · {resultado.validas.length}{" "}
            válido(s) · {resultado.invalidas.length} com erro
          </p>

          {resultado.invalidas.length > 0 && (
            <ul className="mt-1 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-4 text-red-600">
              {resultado.invalidas.map((inv) => (
                <li key={inv.linha}>
                  Linha {inv.linha}: {inv.erros.join("; ")}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex gap-2">
            {resultado.validas.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={pending}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Importar {resultado.validas.length} registro(s) válido(s)
              </button>
            )}
            <button
              type="button"
              onClick={handleCancelar}
              disabled={pending}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mensagem && <p className="mt-1 text-xs font-medium text-green-600">{mensagem}</p>}
    </div>
  );
}
