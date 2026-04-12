import type { User } from "@prisma/client";
import { getTimelineData } from "@/lib/page-data";
import { TimelineBoard } from "@/components/timeline/timeline-board";

export async function TimelinePage({ user, date }: { user: User; date?: string }) {
  const data = await getTimelineData(user.id, user.timezone, date);
  return <TimelineBoard user={user} {...data} />;
}
