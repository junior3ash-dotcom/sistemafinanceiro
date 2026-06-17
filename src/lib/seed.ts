import { type Client } from "@libsql/client";
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

const CATEGORIAS_MOVIMENTO: {
  nome: string;
  tipo: "Entrada" | "Saida";
  subs: string[];
}[] = [
  {
    nome: "Vendas/Repasses",
    tipo: "Entrada",
    subs: [
      "Repasse Shopee - Criativa Decorações",
      "Repasse Shopee - 4A Corte a Laser",
      "Repasse Amazon",
      "Repasse TikTok Shop",
      "Repasse Mercado Livre",
      "Outras Vendas/Receitas",
    ],
  },
  { nome: "Outras Entradas", tipo: "Entrada", subs: [] },
  {
    nome: "Insumos de Produção",
    tipo: "Saida",
    subs: [
      "Compra de MDF BRANCO",
      "Compra de MDF CRU",
      "Compra de MDF ROSA",
      "Compra de LED Fio de Fada",
      "Compra de Fita LED/Outros LEDs",
      "Compra de Cola Quente/Bastão",
      "Compra de Tinta/Verniz",
      "Compra de Fita Dupla Face",
      "Compra de Suporte/Ferragem (pendurar)",
      "Outros Insumos de Produção",
    ],
  },
  {
    nome: "Embalagem e Envio",
    tipo: "Saida",
    subs: [
      "Compra de Caixa de Papelão",
      "Compra de Plástico Bolha",
      "Compra de Saco Plástico/Envelope",
      "Compra de Fita Adesiva/Lacre",
      "Compra de Etiquetas/Impressão",
      "Outros Materiais de Embalagem",
    ],
  },
  {
    nome: "Operacional/Veículo",
    tipo: "Saida",
    subs: [
      "Combustível",
      "Manutenção do Veículo",
      "Manutenção da Máquina de Corte a Laser",
      "Compra de Ferramentas/Equipamentos",
      "Peças de Reposição (máquina)",
    ],
  },
  {
    nome: "Pessoas",
    tipo: "Saida",
    subs: [
      "Folha de Pagamento",
      "Pró-labore - Célio",
      "Pró-labore - Ana",
      "Pró-labore - Família",
      "Vale/Adiantamento Funcionário",
      "Ajuda de Custo",
      "Almoço",
      "Merenda",
    ],
  },
  {
    nome: "Ocupação e Utilidades",
    tipo: "Saida",
    subs: ["Aluguel/Ocupação", "Água", "Energia Elétrica", "Internet/Telefone"],
  },
  {
    nome: "Financeiro e Impostos",
    tipo: "Saida",
    subs: [
      "Impostos (DAS/ISS/Outros)",
      "Empréstimos/Financiamentos",
      "Taxas Bancárias",
      "Tarifas de Antecipação",
    ],
  },
  {
    nome: "Marketing/Ads",
    tipo: "Saida",
    subs: ["Marketing/Impulsionamento (ADS)"],
  },
  {
    nome: "Outras Saídas",
    tipo: "Saida",
    subs: [
      "Seguros (carro/equipamento)",
      "Despesas Administrativas/Contabilidade",
      "Saúde (plano/exames)",
      "Educação/Cursos",
    ],
  },
];

export async function seedIfEmpty(client: Client): Promise<void> {
  const q = (sql: string, args: (string | number | null)[] = []) =>
    client.execute({ sql, args });

  const totalContas = Number(
    ((await q("SELECT COUNT(*) AS n FROM categorias_contas")).rows[0] as unknown as { n: number }).n
  );
  if (totalContas === 0) {
    for (const nome of CATEGORIAS_CONTAS)
      await q("INSERT INTO categorias_contas (nome) VALUES (?)", [nome]);
  }

  const totalMov = Number(
    ((await q("SELECT COUNT(*) AS n FROM categorias_movimento")).rows[0] as unknown as { n: number }).n
  );
  if (totalMov === 0) {
    for (const cat of CATEGORIAS_MOVIMENTO) {
      const r = await q(
        "INSERT INTO categorias_movimento (nome, tipo) VALUES (?, ?)",
        [cat.nome, cat.tipo]
      );
      const catId = Number(r.lastInsertRowid);
      for (const sub of cat.subs)
        await q(
          "INSERT INTO categorias_movimento_sub (categoria_id, nome) VALUES (?, ?)",
          [catId, sub]
        );
    }
  }

  const totalCfg = Number(
    ((await q("SELECT COUNT(*) AS n FROM configuracoes")).rows[0] as unknown as { n: number }).n
  );
  if (totalCfg === 0)
    await q("INSERT INTO configuracoes (chave, valor) VALUES (?, ?)", [
      CHAVE_SALDO_INICIAL,
      "2500",
    ]);
}
