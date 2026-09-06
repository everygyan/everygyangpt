
import { AccountMenu } from "@/components/account-menu";
import type { AppRole } from "@/lib/auth";

export function AdminPageHeader({ title, context, displayName, avatarUrl, role }: { title: string; context: string; displayName: string; avatarUrl: string | null; role: AppRole }) {
  return (
    <header className="admin-topbar">
      <div><p>EveryGyan workspace · {context}</p><h1>{title}</h1></div>
      <AccountMenu displayName={displayName} avatarUrl={avatarUrl} role={role} />
    </header>
  );
}

