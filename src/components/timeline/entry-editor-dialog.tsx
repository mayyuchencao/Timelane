"use client";

import { useEffect, useState } from "react";
import type { Activity, TimeEntry } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";

function toInputValue(date: string | Date) {
  const value = new Date(date);
  const pad = (part: number) => `${part}`.padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function EntryEditorDialog({
  activities,
  open,
  onOpenChange,
  entry,
  onSaved,
}: {
  activities: Activity[];
  open: boolean;
  onOpenChange: (next: boolean) => void;
  entry?: TimeEntry | null;
  onSaved: () => void;
}) {
  const [activityId, setActivityId] = useState(entry?.activityId ?? activities[0]?.id ?? "");
  const [startTime, setStartTime] = useState(entry ? toInputValue(entry.startTime) : "");
  const [endTime, setEndTime] = useState(entry ? toInputValue(entry.endTime) : "");
  const [note, setNote] = useState(entry?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActivityId(entry?.activityId ?? activities[0]?.id ?? "");
    setStartTime(entry ? toInputValue(entry.startTime) : "");
    setEndTime(entry ? toInputValue(entry.endTime) : "");
    setNote(entry?.note ?? "");
  }, [activities, entry]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (entry) {
        await apiFetch(`/api/time-entries/${entry.id}`, {
          method: "PATCH",
          body: JSON.stringify({ activityId, startTime, endTime, note }),
        });
      } else {
        await apiFetch("/api/time-entries/manual", {
          method: "POST",
          body: JSON.stringify({ activityId, startTime, endTime, note }),
        });
      }
      toast.success(entry ? "Entry updated." : "Entry added.");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this entry.");
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    if (!entry) return;
    setIsSaving(true);
    try {
      await apiFetch(`/api/time-entries/${entry.id}`, { method: "DELETE" });
      toast.success("Entry deleted.");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete this entry.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? "Edit time entry" : "Add time entry"}</DialogTitle>
          <DialogDescription>
            Choose an event, set the time range, and keep entries overlap-free. Cross-day ranges split automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Event</Label>
            <SearchableSelect
              value={activityId}
              onValueChange={setActivityId}
              placeholder="Choose an event"
              searchPlaceholder="Search events..."
              options={activities.map((activity) => ({
                value: activity.id,
                label: activity.name,
              }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start</Label>
              <Input id="startTime" type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End</Label>
              <Input id="endTime" type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-3 pt-3">
            {entry ? (
              <Button type="button" variant="ghost" onClick={onDelete} disabled={isSaving}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <div />
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
