import { todayISO } from "./dates";
import { ContaPagar, StatusContaExibicao } from "./types";

export function getStatusExibicao(
  conta: Pick<ContaPagar, "status" | "vencimento">
): StatusContaExibicao {
  if (conta.status === "Pago") return "Pago";
  if (conta.vencimento < todayISO()) return "Vencido";
  return "Pendente";
}

export const STATUS_CORES: Record<StatusContaExibicao, string> = {
  Vencido: "bg-red-100 text-red-800 border-red-300",
  Pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Pago: "bg-green-100 text-green-800 border-green-300",
};
