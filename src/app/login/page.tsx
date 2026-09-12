import LoginForm, { Mode } from "./LoginForm";

function parseMode(value: string | string[] | undefined): Mode {
  return value === "cpf" || value === "cnpj" || value === "admin" ? value : "cpf";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { mode } = await searchParams;

  return <LoginForm initialMode={parseMode(mode)} />;
}
