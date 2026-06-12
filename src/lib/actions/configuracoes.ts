"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CHAVE_SALDO_INICIAL } from "@/lib/constants";

export async function getSaldoInicial(): Promise<number> {
  const row = db
    .prepare("SELECT valor FROM configuracoes WHERE chave = ?")
    .get(CHAVE_SALDO_INICIAL) as { valor: string } | undefined;
  return row ? parseFloat(row.valor) : 0;
}

export async function setSaldoInicial(valor: number) {
  db.prepare(
    "INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor"
  ).run(CHAVE_SALDO_INICIAL, String(valor));
  revalidatePath("/configuracoes");
  revalidatePath("/caixa");
  revalidatePath("/");
}
