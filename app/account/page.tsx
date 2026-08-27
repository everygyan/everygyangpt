import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireUser();
  const params = await searchParams;
  const canWrite = profile.role === "admin" || profile.role === "editor";
  return (
    <main className="account-page">
      <section className="account-card">
        <Link className="admin-logo" href="/">Every<span>Gyan</span></Link>
        <p className="eyebrow">Your account</p>
        <h1>Hello, {profile.display_name}.</h1>
        <p>Your current access level is <strong>{profile.role}</strong>.</p>
        {params.error && <p className="form-message form-error">Your account does not have publishing access. An administrator can promote it in Supabase.</p>}
        <div className="account-actions">
          {canWrite && <Link className="button button-primary" href="/admin">Open publishing dashboard</Link>}
          <Link className="button account-secondary" href="/">Read EveryGyan</Link>
          <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>
        </div>
      </section>
    </main>
  );
}
