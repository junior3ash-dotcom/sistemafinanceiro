export function numeroBR(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

type Celula = string | number | null | undefined;

function escapeCsvCell(value: Celula): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[;"\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCSV(rows: Celula[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(";")).join("\r\n");
}

const BOM = "﻿";

export function csvResponse(csv: string, filename: string): Response {
  return new Response(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
