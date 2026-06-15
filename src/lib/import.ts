// Utilitários para importação de planilhas CSV (mesmo formato usado na exportação:
// delimitador ";", datas dd/mm/aaaa, números com vírgula decimal). O parser também
// aceita arquivos salvos com "," como delimitador (comum ao reabrir/salvar no Excel
// ou Google Sheets em outra localidade).

// Detecta o delimitador olhando a primeira linha não vazia: usa ";" se aparecer
// nela, senão usa ",".
function detectarDelimitador(texto: string): string {
  const primeiraLinha = texto.split(/\r?\n/).find((l) => l.trim() !== "") ?? "";
  return primeiraLinha.includes(";") ? ";" : ",";
}

export function parseCSV(texto: string): string[][] {
  const limpo = texto.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const delimitador = detectarDelimitador(limpo);

  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let dentroAspas = false;

  for (let i = 0; i < limpo.length; i++) {
    const c = limpo[i];

    if (dentroAspas) {
      if (c === '"') {
        if (limpo[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      dentroAspas = true;
    } else if (c === delimitador) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n") {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += c;
    }
  }

  if (campo !== "" || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }

  return linhas.filter((l) => l.some((c) => c.trim() !== ""));
}

// Converte "dd/mm/aaaa" para "aaaa-mm-dd". Retorna null se inválido.
export function parseDataBR(valor: string): string | null {
  const m = valor.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);

  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// Converte "1.234,56" ou "1234,56" ou "1234" para número. Retorna null se inválido.
export function parseNumeroBR(valor: string): number | null {
  const texto = valor.trim();
  if (!texto) return null;

  const limpo = texto.replace(/\./g, "").replace(",", ".");
  const numero = Number(limpo);
  return isNaN(numero) ? null : numero;
}
