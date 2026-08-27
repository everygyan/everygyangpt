import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="back-link" href="/login"><ArrowLeft size={17} /> Back to sign in</Link>
        <Image src="/everygyan-logo.png" alt="EveryGyan" width={260} height={94} priority />
        <div><p className="eyebrow">Account recovery</p><h1>Reset your password.</h1><p>We will email a secure reset link if the address belongs to an account.</p></div>
        <AuthForm action={requestPasswordReset} kind="reset" />
      </div>
      <div className="auth-art"><div><span>SECURE ACCOUNT ACCESS</span><blockquote>Your EveryGyan reading and publishing identity stays with you.</blockquote></div></div>
    </main>
  );
}
