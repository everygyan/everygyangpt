import { requireEditorialUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireEditorialUser();
  return children;
}
