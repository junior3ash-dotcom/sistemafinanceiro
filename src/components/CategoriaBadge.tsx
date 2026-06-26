const PALETA = [
  "bg-blue-100 text-blue-800 border-blue-300",
  "bg-purple-100 text-purple-800 border-purple-300",
  "bg-pink-100 text-pink-800 border-pink-300",
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-teal-100 text-teal-800 border-teal-300",
  "bg-indigo-100 text-indigo-800 border-indigo-300",
  "bg-orange-100 text-orange-800 border-orange-300",
  "bg-cyan-100 text-cyan-800 border-cyan-300",
];

function corPara(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) >>> 0;
  return PALETA[hash % PALETA.length];
}

export default function CategoriaBadge({ nome }: { nome: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${corPara(nome)}`}
    >
      {nome}
    </span>
  );
}
