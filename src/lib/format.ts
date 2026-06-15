export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseBRLInput(valor: string): number {
  if (!valor) return 0;
  const limpo = valor
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3})/g, "")
    .replace(",", ".");
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

export function formatDateBR(iso: string | null): string {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatDateTimeBR(valor: string | null): string {
  if (!valor) return "";
  const [data, hora] = valor.split(" ");
  return hora ? `${formatDateBR(data)} ${hora}` : formatDateBR(data);
}
