"use server";

import { parseCSV, parseDataBR, parseNumeroBR } from "@/lib/import";
import { ENTIDADES, FORMAS_PAGAMENTO } from "@/lib/constants";
import { Entidade, Prioridade, Recorrencia, TipoConta, TipoMovimento } from "@/lib/types";
import { listarCategorias, listarCategoriasMovimento } from "./categorias";
import { criarContaPagar, marcarContaComoPaga, ContaPagarInput } from "./contasPagar";
import { criarMovimento, MovimentoInput } from "./movimentoCaixa";

const RECORRENCIAS_VALIDAS: Recorrencia[] = [
  "Unica",
  "Mensal",
  "Quinzenal",
  "Semanal",
  "Personalizada",
];

const PRIORIDADES_VALIDAS: Prioridade[] = ["Critica", "Importante", "PodeEsperar"];
const TIPOS_CONTA_VALIDOS: TipoConta[] = ["Operacional", "NaoOperacional"];
const TIPOS_MOVIMENTO_VALIDOS: TipoMovimento[] = ["Entrada", "Saida"];
const STATUS_CONTA_VALIDOS = ["Pendente", "Pago"];

export interface ContaImportada extends ContaPagarInput {
  status: string;
  data_pagamento: string | null;
}

export interface LinhaValidada<T> {
  linha: number;
  erros: string[];
  dados: T | null;
}

export interface ResultadoValidacao<T> {
  total: number;
  validas: LinhaValidada<T>[];
  invalidas: LinhaValidada<T>[];
}

export async function validarImportacaoContas(
  csvText: string
): Promise<ResultadoValidacao<ContaImportada>> {
  const linhas = parseCSV(csvText);
  const categorias = (await listarCategorias("contas")).map((c) => c.nome);
  const dataLines = linhas.slice(1);

  const validas: LinhaValidada<ContaImportada>[] = [];
  const invalidas: LinhaValidada<ContaImportada>[] = [];

  dataLines.forEach((cols, idx) => {
    const numeroLinha = idx + 2;
    const erros: string[] = [];
    const get = (i: number) => (cols[i] ?? "").trim();

    const descricao = get(0);
    const categoria = get(1);
    const entidade = get(2) as Entidade;
    const valorStr = get(3);
    const vencimentoStr = get(4);
    const statusStr = get(5) || "Pendente";
    const recorrenciaStr = get(6) || "Unica";
    const recorrenciaDiasStr = get(7);
    const formaPagamento = get(8) || null;
    const prioridadeStr = get(9) || "Importante";
    const tipoStr = get(10) || "Operacional";
    const observacao = get(11) || null;
    const parcelaAtualStr = get(12);
    const parcelasTotalStr = get(13);
    const dataPagamentoStr = get(14);

    if (!descricao) erros.push("Descrição é obrigatória");

    if (!categoria) {
      erros.push("Categoria é obrigatória");
    } else if (!categorias.includes(categoria)) {
      erros.push(
        `Categoria "${categoria}" não cadastrada (Configurações > Categorias - Contas a Pagar)`
      );
    }

    if (!ENTIDADES.includes(entidade)) {
      erros.push(`Entidade inválida: "${entidade}" (use ${ENTIDADES.join(", ")})`);
    }

    const valor = parseNumeroBR(valorStr);
    if (valor === null || valor <= 0) {
      erros.push(`Valor inválido: "${valorStr}" (use formato 1234,56)`);
    }

    const vencimento = parseDataBR(vencimentoStr);
    if (!vencimento) {
      erros.push(`Vencimento inválido: "${vencimentoStr}" (use dd/mm/aaaa)`);
    }

    if (!STATUS_CONTA_VALIDOS.includes(statusStr)) {
      erros.push(`Status inválido: "${statusStr}" (use Pendente ou Pago)`);
    }

    if (!RECORRENCIAS_VALIDAS.includes(recorrenciaStr as Recorrencia)) {
      erros.push(
        `Recorrência inválida: "${recorrenciaStr}" (use ${RECORRENCIAS_VALIDAS.join(", ")})`
      );
    }

    let recorrenciaDias: number | null = null;
    if (recorrenciaStr === "Personalizada") {
      const n = Number(recorrenciaDiasStr);
      if (!recorrenciaDiasStr || isNaN(n) || n <= 0) {
        erros.push(
          "Recorrência (dias) é obrigatória e deve ser um número positivo para recorrência Personalizada"
        );
      } else {
        recorrenciaDias = n;
      }
    }

    if (formaPagamento && !FORMAS_PAGAMENTO.includes(formaPagamento)) {
      erros.push(
        `Forma de pagamento inválida: "${formaPagamento}" (use ${FORMAS_PAGAMENTO.join(", ")})`
      );
    }

    if (!PRIORIDADES_VALIDAS.includes(prioridadeStr as Prioridade)) {
      erros.push(
        `Prioridade inválida: "${prioridadeStr}" (use ${PRIORIDADES_VALIDAS.join(", ")})`
      );
    }

    if (!TIPOS_CONTA_VALIDOS.includes(tipoStr as TipoConta)) {
      erros.push(`Tipo inválido: "${tipoStr}" (use ${TIPOS_CONTA_VALIDOS.join(" ou ")})`);
    }

    let parcelaAtual: number | null = null;
    let parcelasTotal: number | null = null;

    if (parcelasTotalStr) {
      const total = Number(parcelasTotalStr);
      if (isNaN(total) || total < 1) {
        erros.push("Parcelas Total inválido");
      } else {
        parcelasTotal = total;
      }
    }

    if (parcelaAtualStr) {
      const atual = Number(parcelaAtualStr);
      if (isNaN(atual) || atual < 1) {
        erros.push("Parcela Atual inválida");
      } else {
        parcelaAtual = atual;
      }
    }

    if (parcelasTotal && parcelasTotal > 1) {
      if (!parcelaAtual) {
        erros.push("Parcela Atual é obrigatória quando Parcelas Total > 1");
      } else if (parcelaAtual > parcelasTotal) {
        erros.push("Parcela Atual não pode ser maior que Parcelas Total");
      }
      if (statusStr === "Pago") {
        erros.push(
          "Não é possível importar uma compra parcelada já como Paga - importe como Pendente e marque como pago depois"
        );
      }
    }

    let dataPagamento: string | null = null;
    if (statusStr === "Pago") {
      if (!dataPagamentoStr) {
        erros.push("Data Pagamento é obrigatória quando Status = Pago");
      } else {
        dataPagamento = parseDataBR(dataPagamentoStr);
        if (!dataPagamento) {
          erros.push(`Data Pagamento inválida: "${dataPagamentoStr}" (use dd/mm/aaaa)`);
        }
      }
    }

    const item: LinhaValidada<ContaImportada> = {
      linha: numeroLinha,
      erros,
      dados:
        erros.length === 0
          ? {
              descricao,
              categoria,
              entidade,
              valor: valor as number,
              vencimento: vencimento as string,
              status: statusStr,
              recorrencia: recorrenciaStr as Recorrencia,
              recorrencia_dias: recorrenciaDias,
              forma_pagamento: formaPagamento,
              prioridade: prioridadeStr as Prioridade,
              tipo: tipoStr as TipoConta,
              observacao,
              parcela_atual: parcelaAtual,
              parcelas_total: parcelasTotal,
              data_pagamento: dataPagamento,
            }
          : null,
    };

    if (erros.length === 0) validas.push(item);
    else invalidas.push(item);
  });

  return { total: dataLines.length, validas, invalidas };
}

export async function confirmarImportacaoContas(
  itens: ContaImportada[]
): Promise<{ criadas: number }> {
  let criadas = 0;

  for (const item of itens) {
    const ids = await criarContaPagar({
      descricao: item.descricao,
      categoria: item.categoria,
      entidade: item.entidade,
      valor: item.valor,
      vencimento: item.vencimento,
      recorrencia: item.recorrencia,
      recorrencia_dias: item.recorrencia_dias,
      forma_pagamento: item.forma_pagamento,
      prioridade: item.prioridade,
      tipo: item.tipo,
      observacao: item.observacao,
      parcela_atual: item.parcela_atual,
      parcelas_total: item.parcelas_total,
    });

    criadas += ids.length;

    if (item.status === "Pago" && ids.length === 1 && item.data_pagamento) {
      await marcarContaComoPaga(ids[0], item.data_pagamento);
    }
  }

  return { criadas };
}

export async function validarImportacaoCaixa(
  csvText: string
): Promise<ResultadoValidacao<MovimentoInput>> {
  const linhas = parseCSV(csvText);
  const categorias = await listarCategoriasMovimento();
  const dataLines = linhas.slice(1);

  const validas: LinhaValidada<MovimentoInput>[] = [];
  const invalidas: LinhaValidada<MovimentoInput>[] = [];

  dataLines.forEach((cols, idx) => {
    const numeroLinha = idx + 2;
    const erros: string[] = [];
    const get = (i: number) => (cols[i] ?? "").trim();

    const dataStr = get(0);
    const descricao = get(1);
    const categoria = get(2);
    const subcategoria = get(3) || null;
    const entidade = get(4) as Entidade;
    const tipoStr = get(5);
    const valorStr = get(6);
    const formaPagamento = get(7) || null;
    const observacao = get(8) || null;

    const data = parseDataBR(dataStr);
    if (!data) {
      erros.push(`Data inválida: "${dataStr}" (use dd/mm/aaaa)`);
    }

    if (!descricao) erros.push("Descrição é obrigatória");

    if (!TIPOS_MOVIMENTO_VALIDOS.includes(tipoStr as TipoMovimento)) {
      erros.push(`Tipo inválido: "${tipoStr}" (use ${TIPOS_MOVIMENTO_VALIDOS.join(" ou ")})`);
    }

    const categoriaEncontrada = categorias.find((c) => c.nome === categoria);

    if (!categoria) {
      erros.push("Categoria é obrigatória");
    } else if (!categoriaEncontrada) {
      erros.push(
        `Categoria "${categoria}" não cadastrada (Configurações > Categorias - Movimento de Caixa)`
      );
    } else if (
      TIPOS_MOVIMENTO_VALIDOS.includes(tipoStr as TipoMovimento) &&
      categoriaEncontrada.tipo !== tipoStr
    ) {
      erros.push(
        `Categoria "${categoria}" é do tipo ${categoriaEncontrada.tipo}, não pode ser usada em uma linha de ${tipoStr}`
      );
    }

    if (subcategoria && categoriaEncontrada) {
      const subcategoriaValida = categoriaEncontrada.subcategorias.some(
        (s) => s.nome === subcategoria
      );
      if (!subcategoriaValida) {
        erros.push(
          `Subcategoria "${subcategoria}" não cadastrada para a categoria "${categoria}" (Configurações > Categorias - Movimento de Caixa)`
        );
      }
    }

    if (!ENTIDADES.includes(entidade)) {
      erros.push(`Entidade inválida: "${entidade}" (use ${ENTIDADES.join(", ")})`);
    }

    const valor = parseNumeroBR(valorStr);
    if (valor === null || valor <= 0) {
      erros.push(`Valor inválido: "${valorStr}" (use formato 1234,56)`);
    }

    if (formaPagamento && !FORMAS_PAGAMENTO.includes(formaPagamento)) {
      erros.push(
        `Forma de pagamento inválida: "${formaPagamento}" (use ${FORMAS_PAGAMENTO.join(", ")})`
      );
    }

    const item: LinhaValidada<MovimentoInput> = {
      linha: numeroLinha,
      erros,
      dados:
        erros.length === 0
          ? {
              data: data as string,
              descricao,
              categoria,
              subcategoria,
              entidade,
              tipo: tipoStr as TipoMovimento,
              valor: valor as number,
              forma_pagamento: formaPagamento,
              observacao,
              conta_pagar_id: null,
            }
          : null,
    };

    if (erros.length === 0) validas.push(item);
    else invalidas.push(item);
  });

  return { total: dataLines.length, validas, invalidas };
}

export async function confirmarImportacaoCaixa(
  itens: MovimentoInput[]
): Promise<{ criadas: number }> {
  for (const item of itens) {
    await criarMovimento(item);
  }
  return { criadas: itens.length };
}
