"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  excluirContaPagar,
  marcarContaComoPaga,
  marcarContaComoPendente,
} from "@/lib/actions/contasPagar";
import { StatusConta } from "@/lib/types";

export default function ContaAcoes({
  id,
  status,
}: {
  id: number;
  status: StatusConta;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {status === "Pendente" ? (
        <button
          disabled={pending}
          onClick={() => startTransition(() => marcarContaComoPaga(id))}
          className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Marcar como paga
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => marcarContaComoPendente(id))}
          className="rounded-md bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50"
        >
          Reabrir
        </button>
      )}
      <Link
        href={`/contas/${id}`}
        className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
      >
        Editar
      </Link>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Excluir esta conta?")) {
            startTransition(() => excluirContaPagar(id));
          }
        }}
        className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
