import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="mx-auto mt-20 max-w-sm rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-center text-lg font-bold text-zinc-800">
        Gestão Financeira
      </h1>
      <form action={loginAction} className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-700">Senha</label>
        <input
          type="password"
          name="senha"
          autoFocus
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {erro && (
          <p className="text-sm text-red-600">Senha incorreta. Tente novamente.</p>
        )}
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
