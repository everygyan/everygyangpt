import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="back-link" href="/"><ArrowLeft size={17} /> Back to EveryGyan</Link>
        <Image src="/everygyan-logo.png" alt="EveryGyan" width={260} height={94} priority />
        <div><p className="eyebrow">Welcome back</p><h1>Sign in to continue.</h1><p>Join conversations, bookmark useful stories and shape your personal reading list.</p></div>
        <form className="auth-form">
          <label>Email address<input type="email" placeholder="you@example.com" required /></label>
          <label>Password<input type="password" placeholder="Your password" required /></label>
          <div className="auth-options"><label><input type="checkbox" /> Remember me</label><a href="#">Forgot password?</a></div>
          <button className="button button-primary" type="submit">Sign in</button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <button className="magic-button" type="button"><Mail size={18} /> Email me a magic link</button>
        <p className="auth-switch">New to EveryGyan? <a href="#">Create your account</a></p>
      </div>
      <div className="auth-art"><div><span>EVERY DAY, A NEW IDEA</span><blockquote>“The world becomes more interesting when we understand it a little better.”</blockquote></div></div>
    </main>
  );
}

