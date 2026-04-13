"use client";

import { useState } from "react";
import type { Activity, CategoryGroup } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CANDY_COLORS } from "@/lib/constants/colors";
import { apiFetch } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";
import { SearchableSelect } from "@/components/ui/searchable-select";

function ColorDots({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CANDY_COLORS.map((swatch) => (
        <button
          key={swatch.value}
          type="button"
          title={swatch.name}
          className="h-7 w-7 rounded-full"
          style={{
            backgroundColor: swatch.value,
            boxShadow: value === swatch.value ? "inset 0 0 0 2px rgba(255,255,255,0.95)" : "none",
          }}
          onClick={() => onChange(swatch.value)}
        >
          <span className="sr-only">{swatch.name}</span>
        </button>
      ))}
    </div>
  );
}

export function ActivitiesManager({
  groups,
  activities,
}: {
  groups: CategoryGroup[];
  activities: (Activity & { group: CategoryGroup | null })[];
}) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [activityName, setActivityName] = useState("");
  const [groupId, setGroupId] = useState<string>("none");
  const [color, setColor] = useState<string>(CANDY_COLORS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGroupId, setEditGroupId] = useState("none");
  const [editColor, setEditColor] = useState<string>(CANDY_COLORS[0].value);
  const [isSaving, setIsSaving] = useState(false);

  async function createGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await apiFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: groupName, sortOrder: groups.length }),
      });
      toast.success("Group created.");
      setGroupName("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the group.");
    } finally {
      setIsSaving(false);
    }
  }

  async function createActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await apiFetch("/api/activities", {
        method: "POST",
        body: JSON.stringify({ name: activityName, groupId: groupId === "none" ? null : groupId, color }),
      });
      toast.success("Event created.");
      setActivityName("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the event.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteActivity(id: string) {
    try {
      await apiFetch(`/api/activities/${id}`, { method: "DELETE" });
      toast.success("Event deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the event.");
    }
  }

  async function deleteGroup(id: string) {
    try {
      await apiFetch(`/api/groups/${id}`, { method: "DELETE" });
      toast.success("Group deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the group.");
    }
  }

  async function saveGroupEdit() {
    if (!editingGroupId) return;
    setIsSaving(true);
    try {
      await apiFetch(`/api/groups/${editingGroupId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editGroupName,
          sortOrder: groups.findIndex((group) => group.id === editingGroupId),
        }),
      });
      toast.success("Group updated.");
      setEditingGroupId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the group.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(activity: Activity & { group: CategoryGroup | null }) {
    setEditingId(activity.id);
    setEditName(activity.name);
    setEditGroupId(activity.groupId ?? "none");
    setEditColor(activity.color);
  }

  async function saveEdit() {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await apiFetch(`/api/activities/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          groupId: editGroupId === "none" ? null : editGroupId,
          color: editColor,
        }),
      });
      toast.success("Event updated.");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the event.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Activities</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Create the events you want to track.</h1>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <form onSubmit={createGroup} className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Category groups</p>
              <h2 className="mt-2 text-2xl font-semibold">Group your events</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-name">Group name</Label>
              <Input id="group-name" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
            </div>
            <Button type="submit" disabled={isSaving} className="border-x-0 border-t-0 px-0">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create group
            </Button>
          </form>
          <div className="mt-6">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between border-b border-[var(--line)] py-3">
                {editingGroupId === group.id ? (
                  <div className="flex w-full items-center gap-3">
                    <Input value={editGroupName} onChange={(event) => setEditGroupName(event.target.value)} />
                    <Button type="button" size="sm" className="border-x-0 border-t-0 px-0" onClick={saveGroupEdit} disabled={isSaving}>
                      Save
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="border-x-0 border-t-0 px-0" onClick={() => setEditingGroupId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-[var(--muted)]">Order {group.sortOrder + 1}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="border-x-0 border-t-0 px-0"
                        onClick={() => {
                          setEditingGroupId(group.id);
                          setEditGroupName(group.name);
                        }}
                      >
                        Edit
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="border-x-0 border-t-0 px-0" onClick={() => deleteGroup(group.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <form onSubmit={createActivity} className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Events</p>
              <h2 className="mt-2 text-2xl font-semibold">Create a trackable event</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activity-name">Event name</Label>
                <Input id="activity-name" value={activityName} onChange={(event) => setActivityName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Group</Label>
                <SearchableSelect
                  value={groupId}
                  onValueChange={setGroupId}
                  placeholder="Choose a group"
                  searchPlaceholder="Search groups..."
                  options={[
                    { value: "none", label: "No group" },
                    ...groups.map((group) => ({
                      value: group.id,
                      label: group.name,
                    })),
                  ]}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Color</Label>
              <ColorDots value={color} onChange={setColor} />
            </div>
            <Button type="submit" disabled={isSaving} className="border-x-0 border-t-0 px-0">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create event
            </Button>
          </form>
          <div className="mt-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-3">
                {editingId === activity.id ? (
                  <div className="w-full space-y-3">
                    <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <SearchableSelect
                        value={editGroupId}
                        onValueChange={setEditGroupId}
                        placeholder="Choose a group"
                        searchPlaceholder="Search groups..."
                        options={[
                          { value: "none", label: "No group" },
                          ...groups.map((group) => ({
                            value: group.id,
                            label: group.name,
                          })),
                        ]}
                      />
                      <ColorDots value={editColor} onChange={setEditColor} />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" size="sm" className="border-x-0 border-t-0 px-0" onClick={saveEdit} disabled={isSaving}>
                        Save
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="border-x-0 border-t-0 px-0" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activity.color }} />
                        <p className="truncate font-medium">{activity.name}</p>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{activity.group?.name ?? "Ungrouped"}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" size="sm" className="border-x-0 border-t-0 px-0" onClick={() => startEditing(activity)}>
                        Edit
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="border-x-0 border-t-0 px-0" onClick={() => deleteActivity(activity.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
