"use client";

import { useRef, useState, useTransition } from "react";
import {
  criarCategoriaMovimento,
  criarSubcategoria,
  excluirCategoriaMovimento,
  excluirSubcategoria,
  renomearCategoriaMovimento,
  renomearSubcategoria,
} from "@/lib/actions/categorias";
import { CategoriaMovimentoRow, TipoMovimento } from "@/lib/types";

export default function CategoriaMovimentoLista({
  categorias,
}: {
  categorias: CategoriaMovimentoRow[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Secao tipo="Entrada" titulo="Categorias de Entrada" categorias={categorias} />
      <Secao tipo="Saida" titulo="Categorias de Saída" categorias={categorias} />
    </div>
  );
}

function Secao({
  tipo,
  titulo,
  categorias,
}: {
  tipo: TipoMovimento;
  titulo: string;
  categorias: CategoriaMovimentoRow[];
}) {
  const [pending, startTransition] = useTransition();
  const novaRef = useRef<HTMLInputElement>(null);
  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo);

  function adicionar() {
    const valor = novaRef.current?.value.trim();
    if (valor) {
      startTransition(() => criarCategoriaMovimento(valor, tipo));
      if (novaRef.current) novaRef.current.value = "";
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-zinc-700">{titulo}</h3>
      <div className="flex flex-col gap-2">
        {categoriasDoTipo.map((cat) => (
          <CategoriaItem key={cat.id} categoria={cat} tipo={tipo} />
        ))}

        <div className="flex items-center gap-2 pt-1">
          <input
            ref={novaRef}
            type="text"
            placeholder="Nova categoria..."
            className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
          />
          <button
            disabled={pending}
            onClick={adicionar}
            className="rounded-md bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-200 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriaItem({
  categoria,
  tipo,
}: {
  categoria: CategoriaMovimentoRow;
  tipo: TipoMovimento;
}) {
  const [pending, startTransition] = useTransition();
  const [expandido, setExpandido] = useState(false);
  const novaSubRef = useRef<HTMLInputElement>(null);

  function adicionarSub() {
    const valor = novaSubRef.current?.value.trim();
    if (valor) {
      startTransition(() => criarSubcategoria(categoria.id, valor));
      if (novaSubRef.current) novaSubRef.current.value = "";
    }
  }

  return (
    <div className="rounded-md border border-zinc-200 p-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          defaultValue={categoria.nome}
          className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          onBlur={(e) => {
            const novoNome = e.target.value.trim();
            if (novoNome && novoNome !== categoria.nome) {
              startTransition(() =>
                renomearCategoriaMovimento(categoria.id, novoNome, tipo)
              );
            }
          }}
        />
        <button
          onClick={() => setExpandido((v) => !v)}
          className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
        >
          {expandido ? "Ocultar sub." : "Subcategorias"}
          {categoria.subcategorias.length > 0 && ` (${categoria.subcategorias.length})`}
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Excluir a categoria "${categoria.nome}"?`)) {
              startTransition(() => excluirCategoriaMovimento(categoria.id));
            }
          }}
          className="rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
        >
          Excluir
        </button>
      </div>

      {expandido && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-zinc-100 pt-2 pl-4">
          {categoria.subcategorias.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={sub.nome}
                className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                onBlur={(e) => {
                  const novoNome = e.target.value.trim();
                  if (novoNome && novoNome !== sub.nome) {
                    startTransition(() => renomearSubcategoria(sub.id, novoNome));
                  }
                }}
              />
              <button
                disabled={pending}
                onClick={() => {
                  if (confirm(`Excluir a subcategoria "${sub.nome}"?`)) {
                    startTransition(() => excluirSubcategoria(sub.id));
                  }
                }}
                className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <input
              ref={novaSubRef}
              type="text"
              placeholder="Nova subcategoria..."
              className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarSub();
                }
              }}
            />
            <button
              disabled={pending}
              onClick={adicionarSub}
              className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
