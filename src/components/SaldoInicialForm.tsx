"use client";

import { useState, useTransition } from "react";
import { setSaldoInicial } from "@/lib/actions/configuracoes";
import { parseBRLInput } from "@/lib/format";

export default function SaldoInicialForm({ saldoInicial }: { saldoInicial: number }) {
  const [valor, setValor] = useState(saldoInicial.toFixed(2).replace(".", ","));
  const [pending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Saldo inicial (R$)</label>
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setSalvo(false);
          }}
          className="rounded-md border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setSaldoInicial(parseBRLInput(valor));
            setSalvo(true);
          })
        }
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Salvar
      </button>
      {salvo && <span className="pb-2 text-sm text-green-700">Salvo!</span>}
    </div>
  );
}
