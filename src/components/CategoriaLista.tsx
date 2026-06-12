"use client";

import { useRef, useTransition } from "react";
import {
  criarCategoria,
  excluirCategoria,
  renomearCategoria,
} from "@/lib/actions/categorias";
import { CategoriaRow } from "@/lib/types";

export default function CategoriaLista({
  tipo,
  categorias,
}: {
  tipo: "contas" | "movimento";
  categorias: CategoriaRow[];
}) {
  const [pending, startTransition] = useTransition();
  const novaRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      {categorias.map((cat) => (
        <div key={cat.id} className="flex items-center gap-2">
          <input
            type="text"
            defaultValue={cat.nome}
            className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            onBlur={(e) => {
              const novoNome = e.target.value.trim();
              if (novoNome && novoNome !== cat.nome) {
                startTransition(() =>
                  renomearCategoria(tipo, cat.id, novoNome)
                );
              }
            }}
          />
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Excluir a categoria "${cat.nome}"?`)) {
                startTransition(() => excluirCategoria(tipo, cat.id));
              }
            }}
            className="rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
          >
            Excluir
          </button>
        </div>
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
              const valor = novaRef.current?.value.trim();
              if (valor) {
                startTransition(() => criarCategoria(tipo, valor));
                if (novaRef.current) novaRef.current.value = "";
              }
            }
          }}
        />
        <button
          disabled={pending}
          onClick={() => {
            const valor = novaRef.current?.value.trim();
            if (valor) {
              startTransition(() => criarCategoria(tipo, valor));
              if (novaRef.current) novaRef.current.value = "";
            }
          }}
          className="rounded-md bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-200 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
