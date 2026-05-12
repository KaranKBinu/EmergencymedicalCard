import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <RegisterForm />;
}
