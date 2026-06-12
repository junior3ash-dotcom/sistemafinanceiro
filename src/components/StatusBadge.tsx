import { STATUS_CORES } from "@/lib/statusConta";
import { StatusContaExibicao } from "@/lib/types";

export default function StatusBadge({ status }: { status: StatusContaExibicao }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CORES[status]}`}
    >
      {status}
    </span>
  );
}
