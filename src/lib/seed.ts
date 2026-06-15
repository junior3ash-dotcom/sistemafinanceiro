import { db } from "./db";
import { addDaysISO, todayISO } from "./dates";
import { CHAVE_SALDO_INICIAL } from "./constants";

const CATEGORIAS_CONTAS = [
  "Matéria-prima (MDF/LED)",
  "Embalagens",
  "Marketing/Ads",
  "Taxas Marketplace",
  "Frete/Logística",
  "Impostos",
  "Contabilidade",
  "Energia/Internet",
  "Ferramentas/Software",
  "Aluguel",
  "Pró-labore",
  "Outros",
];

const CATEGORIAS_MOVIMENTO: { nome: string; tipo: "Entrada" | "Saida" }[] = [
  { nome: "Vendas Shopee Loja 1", tipo: "Entrada" },
  { nome: "Vendas Shopee Loja 2", tipo: "Entrada" },
  { nome: "Vendas Amazon", tipo: "Entrada" },
  { nome: "Vendas TikTok Shop", tipo: "Entrada" },
  { nome: "Vendas Mercado Livre", tipo: "Entrada" },
  { nome: "Matéria-prima", tipo: "Saida" },
  { nome: "Embalagens", tipo: "Saida" },
  { nome: "Marketing/Ads", tipo: "Saida" },
  { nome: "Taxas Marketplace", tipo: "Saida" },
  { nome: "Frete", tipo: "Saida" },
  { nome: "Impostos", tipo: "Saida" },
  { nome: "Energia/Internet", tipo: "Saida" },
  { nome: "Retirada Pró-labore", tipo: "Saida" },
  { nome: "Outros", tipo: "Saida" },
];

export function seedIfEmpty() {
  const totalCategoriasContas = (
    db.prepare("SELECT COUNT(*) AS n FROM categorias_contas").get() as {
      n: number;
    }
  ).n;

  if (totalCategoriasContas === 0) {
    const inserirCategoriaConta = db.prepare(
      "INSERT INTO categorias_contas (nome) VALUES (?)"
    );
    for (const nome of CATEGORIAS_CONTAS) inserirCategoriaConta.run(nome);
  }

  const totalCategoriasMovimento = (
    db.prepare("SELECT COUNT(*) AS n FROM categorias_movimento").get() as {
      n: number;
    }
  ).n;

  if (totalCategoriasMovimento === 0) {
    const inserirCategoriaMovimento = db.prepare(
      "INSERT INTO categorias_movimento (nome, tipo) VALUES (?, ?)"
    );
    for (const { nome, tipo } of CATEGORIAS_MOVIMENTO) {
      inserirCategoriaMovimento.run(nome, tipo);
    }
  }

  const totalConfig = (
    db.prepare("SELECT COUNT(*) AS n FROM configuracoes").get() as {
      n: number;
    }
  ).n;

  if (totalConfig === 0) {
    db.prepare("INSERT INTO configuracoes (chave, valor) VALUES (?, ?)").run(
      CHAVE_SALDO_INICIAL,
      "2500"
    );
  }

  const totalContas = (
    db.prepare("SELECT COUNT(*) AS n FROM contas_pagar").get() as {
      n: number;
    }
  ).n;

  if (totalContas === 0) {
    const hoje = todayISO();

    const inserirConta = db.prepare(
      `INSERT INTO contas_pagar (
        descricao, categoria, entidade, valor, vencimento, status,
        recorrencia, recorrencia_dias, forma_pagamento, prioridade, tipo,
        observacao, parcela_atual, parcelas_total, grupo_parcelamento_id, conta_origem_id
      ) VALUES (@descricao, @categoria, @entidade, @valor, @vencimento, @status,
        @recorrencia, @recorrencia_dias, @forma_pagamento, @prioridade, @tipo,
        @observacao, @parcela_atual, @parcelas_total, @grupo_parcelamento_id, @conta_origem_id)`
    );

    const base = {
      status: "Pendente",
      recorrencia_dias: null as number | null,
      forma_pagamento: "Pix",
      observacao: "",
      parcela_atual: null as number | null,
      parcelas_total: null as number | null,
      grupo_parcelamento_id: null as string | null,
      conta_origem_id: null as number | null,
    };

    inserirConta.run({
      ...base,
      descricao: "Aluguel da sala/estoque",
      categoria: "Aluguel",
      entidade: "Empresa",
      valor: 1200,
      vencimento: addDaysISO(hoje, 3),
      recorrencia: "Mensal",
      prioridade: "Critica",
      tipo: "Operacional",
      forma_pagamento: "Transferência",
    });

    inserirConta.run({
      ...base,
      descricao: "Internet + telefone",
      categoria: "Energia/Internet",
      entidade: "CNPJ 1",
      valor: 149.9,
      vencimento: addDaysISO(hoje, 7),
      recorrencia: "Mensal",
      prioridade: "Importante",
      tipo: "Operacional",
      forma_pagamento: "Boleto",
    });

    inserirConta.run({
      ...base,
      descricao: "Honorários contador",
      categoria: "Contabilidade",
      entidade: "CNPJ 1",
      valor: 250,
      vencimento: addDaysISO(hoje, 10),
      recorrencia: "Mensal",
      prioridade: "Importante",
      tipo: "NaoOperacional",
      forma_pagamento: "Pix",
    });

    inserirConta.run({
      ...base,
      descricao: "DAS Simples Nacional - CNPJ 1",
      categoria: "Impostos",
      entidade: "CNPJ 1",
      valor: 75.6,
      vencimento: addDaysISO(hoje, -2),
      recorrencia: "Mensal",
      prioridade: "Critica",
      tipo: "Operacional",
      forma_pagamento: "Boleto",
      observacao: "Pagar via app do banco",
    });

    inserirConta.run({
      ...base,
      descricao: "DAS Simples Nacional - CNPJ 2",
      categoria: "Impostos",
      entidade: "CNPJ 2",
      valor: 71.2,
      vencimento: addDaysISO(hoje, -2),
      recorrencia: "Mensal",
      prioridade: "Critica",
      tipo: "Operacional",
      forma_pagamento: "Boleto",
    });

    inserirConta.run({
      ...base,
      descricao: "Assinatura CorelDRAW",
      categoria: "Ferramentas/Software",
      entidade: "PF",
      valor: 99,
      vencimento: addDaysISO(hoje, 12),
      recorrencia: "Mensal",
      prioridade: "PodeEsperar",
      tipo: "NaoOperacional",
      forma_pagamento: "Cartão de Crédito",
    });

    inserirConta.run({
      ...base,
      descricao: "Anúncios Shopee Ads",
      categoria: "Marketing/Ads",
      entidade: "CNPJ 1",
      valor: 300,
      vencimento: addDaysISO(hoje, 1),
      recorrencia: "Quinzenal",
      prioridade: "Importante",
      tipo: "Operacional",
      forma_pagamento: "Cartão de Crédito",
    });

    // Compra parcelada de MDF (3x)
    const grupoMdf = "seed-mdf-3x";
    for (let parcela = 1; parcela <= 3; parcela++) {
      inserirConta.run({
        ...base,
        descricao: `Chapas de MDF 3mm (compra em 3x) - parcela ${parcela}/3`,
        categoria: "Matéria-prima (MDF/LED)",
        entidade: "CNPJ 1",
        valor: 480,
        vencimento: addDaysISO(hoje, 5 + (parcela - 1) * 30),
        recorrencia: "Unica",
        prioridade: "Importante",
        tipo: "Operacional",
        forma_pagamento: "Cartão de Crédito",
        parcela_atual: parcela,
        parcelas_total: 3,
        grupo_parcelamento_id: grupoMdf,
      });
    }

    // Rolos de fio de fada LED, pago no mês passado (exemplo de conta já paga)
    inserirConta.run({
      ...base,
      descricao: "Rolos de fio de fada LED (lote)",
      categoria: "Matéria-prima (MDF/LED)",
      entidade: "CNPJ 2",
      valor: 620,
      vencimento: addDaysISO(hoje, -10),
      status: "Pago",
      recorrencia: "Unica",
      prioridade: "Importante",
      tipo: "Operacional",
      forma_pagamento: "Pix",
    });
    db.prepare(
      "UPDATE contas_pagar SET data_pagamento = ? WHERE descricao = 'Rolos de fio de fada LED (lote)'"
    ).run(addDaysISO(hoje, -10));
  }

  const totalMovimentos = (
    db.prepare("SELECT COUNT(*) AS n FROM movimento_caixa").get() as {
      n: number;
    }
  ).n;

  if (totalMovimentos === 0) {
    const hoje = todayISO();

    const inserirMovimento = db.prepare(
      `INSERT INTO movimento_caixa (
        data, descricao, categoria, entidade, tipo, valor, forma_pagamento, observacao, conta_pagar_id
      ) VALUES (@data, @descricao, @categoria, @entidade, @tipo, @valor, @forma_pagamento, @observacao, @conta_pagar_id)`
    );

    const base = {
      forma_pagamento: "Pix",
      observacao: "",
      conta_pagar_id: null as number | null,
    };

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -10),
      descricao: "Vendas do dia - Shopee Loja 1",
      categoria: "Vendas Shopee Loja 1",
      entidade: "CNPJ 1",
      tipo: "Entrada",
      valor: 540,
    });

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -10),
      descricao: "Pagamento rolos de fio de fada LED",
      categoria: "Matéria-prima (MDF/LED)",
      entidade: "CNPJ 2",
      tipo: "Saida",
      valor: 620,
    });

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -7),
      descricao: "Vendas do dia - Mercado Livre",
      categoria: "Vendas Mercado Livre",
      entidade: "CNPJ 2",
      tipo: "Entrada",
      valor: 312.5,
    });

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -5),
      descricao: "Compra de embalagens (caixas + plástico bolha)",
      categoria: "Embalagens",
      entidade: "CNPJ 1",
      tipo: "Saida",
      valor: 180,
    });

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -3),
      descricao: "Vendas do dia - Shopee Loja 2",
      categoria: "Vendas Shopee Loja 2",
      entidade: "CNPJ 2",
      tipo: "Entrada",
      valor: 421.9,
    });

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -2),
      descricao: "Vendas do dia - Amazon",
      categoria: "Vendas Amazon",
      entidade: "CNPJ 1",
      tipo: "Entrada",
      valor: 268,
    });

    inserirMovimento.run({
      ...base,
      data: addDaysISO(hoje, -1),
      descricao: "Frete adicional para reposição de estoque",
      categoria: "Frete",
      entidade: "Empresa",
      tipo: "Saida",
      valor: 95,
    });

    inserirMovimento.run({
      ...base,
      data: hoje,
      descricao: "Vendas do dia - TikTok Shop",
      categoria: "Vendas TikTok Shop",
      entidade: "CNPJ 1",
      tipo: "Entrada",
      valor: 187.3,
    });
  }
}
