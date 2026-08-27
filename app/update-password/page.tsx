import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default function UpdatePasswordPage() {
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to EveryGyan</Link>
        <Image src="/everygyan-logo.png" alt="EveryGyan" width={260} height={94} priority />
        <div><p className="eyebrow">Choose a new password</p><h1>Update your password.</h1><p>Use at least eight characters and keep it unique to EveryGyan.</p></div>
        <AuthForm action={updatePassword} kind="update" />
      </div>
      <div className="auth-art"><div><span>EVERYGYAN ACCOUNT</span><blockquote>A secure account is the beginning of a trusted community.</blockquote></div></div>
    </main>
  );
}
