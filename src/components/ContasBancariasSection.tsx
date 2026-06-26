"use client";

import { useState, useTransition } from "react";
import {
  atualizarContaBancaria,
  criarContaBancaria,
  excluirContaBancaria,
  ContaBancariaComSaldo,
} from "@/lib/actions/contasBancarias";
import { formatBRL, parseBRLInput } from "@/lib/format";

export default function ContasBancariasSection({
  contas,
}: {
  contas: ContaBancariaComSaldo[];
}) {
  const [pending, startTransition] = useTransition();
  const [novoNome, setNovoNome] = useState("");
  const [novoSaldo, setNovoSaldo] = useState("0,00");
  const [cofrinhoAberto, setCofrinhoAberto] = useState<number | null>(null);
  const [nomeCofrinho, setNomeCofrinho] = useState("");
  const [saldoCofrinho, setSaldoCofrinho] = useState("0,00");
  const [editando, setEditando] = useState<number | null>(null);
  const [edNome, setEdNome] = useState("");
  const [edSaldo, setEdSaldo] = useState("0,00");

  function adicionarConta() {
    if (!novoNome.trim()) return;
    startTransition(async () => {
      await criarContaBancaria(novoNome.trim(), parseBRLInput(novoSaldo), null);
      setNovoNome("");
      setNovoSaldo("0,00");
    });
  }

  function adicionarCofrinho(paiId: number) {
    if (!nomeCofrinho.trim()) return;
    startTransition(async () => {
      await criarContaBancaria(nomeCofrinho.trim(), parseBRLInput(saldoCofrinho), paiId);
      setNomeCofrinho("");
      setSaldoCofrinho("0,00");
      setCofrinhoAberto(null);
    });
  }

  function iniciarEdicao(c: ContaBancariaComSaldo) {
    setEditando(c.id);
    setEdNome(c.nome);
    setEdSaldo(c.saldo_inicial.toFixed(2).replace(".", ","));
  }

  function salvarEdicao(id: number) {
    startTransition(async () => {
      await atualizarContaBancaria(id, edNome.trim(), parseBRLInput(edSaldo));
      setEditando(null);
    });
  }

  function excluir(id: number, nome: string) {
    if (!confirm(`Excluir "${nome}"? Lançamentos vinculados ficarão sem conta.`)) return;
    startTransition(() => excluirContaBancaria(id));
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-1 text-base font-semibold text-zinc-800">Contas Bancárias</h2>
      <p className="mb-3 text-sm text-zinc-500">
        Cadastre cada banco com seu saldo inicial. Dentro de cada banco você
        pode criar cofrinhos (reservas financeiras) — o saldo deles não entra
        no cálculo de dinheiro disponível para pagar contas.
      </p>

      <div className="flex flex-col gap-3">
        {contas.length === 0 && (
          <p className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-500">
            Nenhuma conta bancária cadastrada ainda.
          </p>
        )}

        {contas.map((conta) => (
          <div key={conta.id} className="rounded-md border border-zinc-200 p-3">
            {editando === conta.id ? (
              <div className="flex flex-wrap items-end gap-2">
                <input
                  value={edNome}
                  onChange={(e) => setEdNome(e.target.value)}
                  className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                />
                <input
                  value={edSaldo}
                  onChange={(e) => setEdSaldo(e.target.value)}
                  inputMode="decimal"
                  className="w-32 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                />
                <button
                  disabled={pending}
                  onClick={() => salvarEdicao(conta.id)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-zinc-800">{conta.nome}</div>
                  <div
                    className={`text-sm font-semibold ${conta.saldo >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatBRL(conta.saldo)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCofrinhoAberto(cofrinhoAberto === conta.id ? null : conta.id)
                    }
                    className="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 hover:bg-purple-200"
                  >
                    + Cofrinho
                  </button>
                  <button
                    onClick={() => iniciarEdicao(conta)}
                    className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  >
                    Editar
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => excluir(conta.id, conta.nome)}
                    className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}

            {conta.cofrinhos.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3">
                {conta.cofrinhos.map((cof) => (
                  <div
                    key={cof.id}
                    className="flex items-center justify-between rounded-md bg-purple-50 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium text-purple-900">
                        🐷 {cof.nome}
                      </div>
                      <div className="text-sm font-semibold text-purple-700">
                        {formatBRL(cof.saldo)}
                      </div>
                    </div>
                    <button
                      disabled={pending}
                      onClick={() => excluir(cof.id, cof.nome)}
                      className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cofrinhoAberto === conta.id && (
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-3">
                <input
                  placeholder="Nome do cofrinho"
                  value={nomeCofrinho}
                  onChange={(e) => setNomeCofrinho(e.target.value)}
                  className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Saldo inicial"
                  value={saldoCofrinho}
                  onChange={(e) => setSaldoCofrinho(e.target.value)}
                  inputMode="decimal"
                  className="w-32 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                />
                <button
                  disabled={pending}
                  onClick={() => adicionarCofrinho(conta.id)}
                  className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Adicionar cofrinho
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-zinc-200 pt-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Nome do banco</label>
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Ex: C6 Bank - Criativa"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Saldo inicial (R$)</label>
          <input
            value={novoSaldo}
            onChange={(e) => setNovoSaldo(e.target.value)}
            inputMode="decimal"
            className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          disabled={pending}
          onClick={adicionarConta}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Adicionar conta bancária
        </button>
      </div>
    </div>
  );
}
