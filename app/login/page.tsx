import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signIn } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to EveryGyan</Link>
        <Image src="/everygyan-logo.png" alt="EveryGyan" width={260} height={94} priority />
        <div><p className="eyebrow">Welcome back</p><h1>Sign in to continue.</h1><p>Join conversations, bookmark useful stories and manage your reading account.</p></div>
        {params.error && <p className="form-message form-error">That sign-in link is invalid or expired. Please try again.</p>}
        <AuthForm action={signIn} kind="signin" next={params.next} />
        <p className="auth-switch">New to EveryGyan? <Link href="/signup">Create your account</Link></p>
      </div>
      <div className="auth-art"><div><span>EVERY DAY, A NEW IDEA</span><blockquote>“The world becomes more interesting when we understand it a little better.”</blockquote></div></div>
    </main>
  );
}
