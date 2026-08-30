import type { Metadata } from "next";
import { GermanLearningHub } from "@/components/german-learning-hub";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile } from "@/lib/auth";
import { getGermanCatalog, getGermanProgress } from "@/lib/german-course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learn German A1–C1",
  description: "Build practical German skills from beginner A1 to advanced C1 with short interactive lessons and free learning resources.",
};

export default async function LearnGermanPage() {
  const [catalogResult, profile] = await Promise.all([getGermanCatalog(), getCurrentProfile()]);
  const progress = await getGermanProgress(profile?.id ?? null);

  return (
    <>
      <SiteHeader />
      <main className="german-page">
        <GermanLearningHub
          catalog={catalogResult.catalog}
          catalogSource={catalogResult.source}
          initialProgress={progress}
          learnerName={profile?.display_name ?? null}
        />
      </main>
      <SiteFooter />
    </>
  );
}
