"use client";

import { useTransition } from "react";
import Link from "next/link";
import { excluirMovimento } from "@/lib/actions/movimentoCaixa";

export default function MovimentoAcoes({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/caixa/${id}`}
        className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
      >
        Editar
      </Link>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Excluir este lançamento?")) {
            startTransition(() => excluirMovimento(id));
          }
        }}
        className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
