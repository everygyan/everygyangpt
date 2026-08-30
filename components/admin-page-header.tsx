import { signOut } from "@/app/auth/actions";

export function AdminPageHeader({ title, context, displayName }: { title: string; context: string; displayName: string }) {
  const firstName = displayName.split(" ")[0] || "Admin";
  return (
    <header className="admin-topbar">
      <div><p>EveryGyan workspace · {context}</p><h1>{title}</h1></div>
      <div className="admin-account">
        <div className="author-avatar">{firstName[0]?.toUpperCase()}</div>
        <form action={signOut}><button type="submit">Sign out</button></form>
      </div>
    </header>
  );
}
