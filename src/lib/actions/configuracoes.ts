"use server";

import { revalidatePath } from "next/cache";
import { dbGet, dbRun } from "@/lib/db";
import { CHAVE_SALDO_INICIAL } from "@/lib/constants";

export async function getSaldoInicial(): Promise<number> {
  const row = await dbGet<{ valor: string }>(
    "SELECT valor FROM configuracoes WHERE chave = ?",
    [CHAVE_SALDO_INICIAL]
  );
  return row ? parseFloat(row.valor) : 0;
}

export async function setSaldoInicial(valor: number) {
  await dbRun(
    "INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor",
    [CHAVE_SALDO_INICIAL, String(valor)]
  );
  revalidatePath("/configuracoes");
  revalidatePath("/caixa");
  revalidatePath("/");
}
