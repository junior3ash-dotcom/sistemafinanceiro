import { Entidade, Prioridade, Recorrencia, TipoConta } from "./types";

export const ENTIDADES: Entidade[] = ["CNPJ 1", "CNPJ 2", "PF", "Empresa"];

export const RECORRENCIAS: { value: Recorrencia; label: string }[] = [
  { value: "Unica", label: "Única" },
  { value: "Mensal", label: "Mensal" },
  { value: "Quinzenal", label: "Quinzenal" },
  { value: "Semanal", label: "Semanal" },
  { value: "Personalizada", label: "Personalizada (a cada X dias)" },
];

export const PRIORIDADES: { value: Prioridade; label: string }[] = [
  { value: "Critica", label: "Crítica" },
  { value: "Importante", label: "Importante" },
  { value: "PodeEsperar", label: "Pode Esperar" },
];

export const TIPOS_CONTA: { value: TipoConta; label: string }[] = [
  { value: "Operacional", label: "Operacional" },
  { value: "NaoOperacional", label: "Não Operacional" },
];

export const FORMAS_PAGAMENTO: string[] = [
  "Pix",
  "Boleto",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência",
  "Dinheiro",
  "Outro",
];

export const CHAVE_SALDO_INICIAL = "saldo_inicial";
