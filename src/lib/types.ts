export type Entidade = "CNPJ 1" | "CNPJ 2" | "PF" | "Empresa";

export type StatusConta = "Pendente" | "Pago";
export type StatusContaExibicao = "Vencido" | "Pendente" | "Pago";

export type Recorrencia = "Unica" | "Mensal" | "Quinzenal" | "Semanal" | "Personalizada";

export type Prioridade = "Critica" | "Importante" | "PodeEsperar";

export type TipoConta = "Operacional" | "NaoOperacional";

export type TipoMovimento = "Entrada" | "Saida";

export interface ContaPagar {
  id: number;
  descricao: string;
  categoria: string;
  entidade: Entidade;
  valor: number;
  vencimento: string; // ISO yyyy-mm-dd
  status: StatusConta;
  recorrencia: Recorrencia;
  recorrencia_dias: number | null;
  forma_pagamento: string | null;
  prioridade: Prioridade;
  tipo: TipoConta;
  observacao: string | null;
  parcela_atual: number | null;
  parcelas_total: number | null;
  grupo_parcelamento_id: string | null;
  conta_origem_id: number | null;
  data_pagamento: string | null;
  criado_em: string;
}

export interface MovimentoCaixa {
  id: number;
  data: string; // ISO yyyy-mm-dd
  descricao: string;
  categoria: string;
  entidade: Entidade;
  tipo: TipoMovimento;
  valor: number;
  forma_pagamento: string | null;
  observacao: string | null;
  conta_pagar_id: number | null;
  criado_em: string;
}

export interface CategoriaRow {
  id: number;
  nome: string;
}
