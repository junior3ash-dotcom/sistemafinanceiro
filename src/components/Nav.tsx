"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

const LINKS = [
  { href: "/", label: "Resumo" },
  { href: "/contas", label: "Contas a Pagar" },
  { href: "/caixa", label: "Caixa" },
  { href: "/configuracoes", label: "Configurações" },
];

export default function Nav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 bg-zinc-900 text-white shadow">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-2 py-2 sm:px-4">
        <span className="mr-2 shrink-0 text-sm font-bold tracking-wide text-zinc-300">
          Gestão Financeira
        </span>
        {LINKS.map((link) => {
          const ativo =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                ativo
                  ? "bg-blue-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <form action={logoutAction} className="ml-auto shrink-0">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Sair
          </button>
        </form>
      </div>
    </nav>
  );
}
