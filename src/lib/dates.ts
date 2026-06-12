import {
  addDays as addDaysFn,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  lastDayOfMonth,
  startOfWeek,
} from "date-fns";

// Datas são tratadas como strings ISO "yyyy-MM-dd" sem horário, em horário local,
// para evitar problemas de fuso horário.

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function parseISO(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function toISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function addDaysISO(iso: string, dias: number): string {
  return toISO(addDaysFn(parseISO(iso), dias));
}

export function addMonthsSameDayISO(iso: string, meses: number): string {
  return toISO(addMonths(parseISO(iso), meses));
}

export function isAntesDe(iso: string, referencia: string): boolean {
  return iso < referencia;
}

export type TipoPeriodo = "semana" | "quinzena" | "mes" | "personalizado";

export interface Periodo {
  inicio: string;
  fim: string;
}

export function getPeriodo(
  tipo: TipoPeriodo,
  base = todayISO(),
  personalizado?: Periodo
): Periodo {
  const dataBase = parseISO(base);

  switch (tipo) {
    case "semana": {
      return {
        inicio: toISO(startOfWeek(dataBase, { weekStartsOn: 1 })),
        fim: toISO(endOfWeek(dataBase, { weekStartsOn: 1 })),
      };
    }
    case "mes": {
      return {
        inicio: format(dataBase, "yyyy-MM-01"),
        fim: toISO(endOfMonth(dataBase)),
      };
    }
    case "quinzena": {
      const dia = dataBase.getDate();
      if (dia <= 15) {
        return {
          inicio: format(dataBase, "yyyy-MM-01"),
          fim: format(dataBase, "yyyy-MM-15"),
        };
      }
      return {
        inicio: format(dataBase, "yyyy-MM-16"),
        fim: toISO(lastDayOfMonth(dataBase)),
      };
    }
    case "personalizado": {
      if (!personalizado) {
        throw new Error("Período personalizado requer datas de início e fim");
      }
      return personalizado;
    }
  }
}
