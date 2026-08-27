import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signUp } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to EveryGyan</Link>
        <Image src="/everygyan-logo.png" alt="EveryGyan" width={260} height={94} priority />
        <div><p className="eyebrow">Join EveryGyan</p><h1>Create your account.</h1><p>Register to participate in the EveryGyan community. New accounts start with the reader role.</p></div>
        <AuthForm action={signUp} kind="signup" />
        <p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p>
      </div>
      <div className="auth-art"><div><span>KNOW MORE. LIVE BETTER.</span><blockquote>One account connects you to ideas across travel, news, health and learning.</blockquote></div></div>
    </main>
  );
}
