import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SubscribersPage() {
  const profile = await requireAdminUser();
  const supabase = await createClient();
  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status, locale, consent_source, consented_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <main className="admin-shell">
      <AdminSidebar active="subscribers" role={profile.role} />
      <section className="admin-main">
        <AdminPageHeader title="Newsletter subscribers" context="audience" displayName={profile.display_name} />
        <div className="admin-content">
          <div className="admin-page-heading"><div><p className="eyebrow">Newsletter</p><h2>Your subscriber audience</h2><p>Review active, pending and unsubscribed readers in one place.</p></div></div>
          <section className="admin-table-card admin-library-card">
            {error && <p className="admin-inline-error">{error.message}</p>}
            <div className="subscriber-table" role="table" aria-label="Newsletter subscribers">
              <div className="subscriber-row subscriber-head" role="row"><span>Email</span><span>Status</span><span>Locale</span><span>Joined</span></div>
              {(subscribers ?? []).map((subscriber) => (
                <div className="subscriber-row" role="row" key={subscriber.id}>
                  <strong>{subscriber.email}</strong>
                  <span className={`subscriber-status status-${subscriber.status}`}>{subscriber.status}</span>
                  <span>{subscriber.locale?.toUpperCase() || "EN"}</span>
                  <span>{new Date(subscriber.consented_at || subscriber.created_at).toLocaleDateString("en-GB")}</span>
                </div>
              ))}
              {!subscribers?.length && !error && <div className="admin-empty"><strong>No subscribers yet.</strong><span>Confirmed newsletter subscriptions will appear here.</span></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
