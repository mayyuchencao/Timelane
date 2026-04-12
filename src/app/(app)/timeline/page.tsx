import { TimelinePage } from "@/components/timeline/timeline-page";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string }>;

export default async function TimelineRoute({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const { date } = await searchParams;
  return <TimelinePage user={user} date={date} />;
}
