/**
 * Offline Write Queue
 *
 * Persists failed DB writes to localStorage and replays them
 * when connectivity is restored. Supports topic_progress and
 * daily_quiz_results operations.
 */

import { supabase } from "@/integrations/supabase/client";

export type QueuedOperation =
  | {
      type: "upsert_topic_progress";
      payload: {
        user_id: string;
        topic_title: string;
        explored: boolean;
        last_visited: string;
      };
      queuedAt: string;
    }
  | {
      type: "upsert_quiz_result";
      payload: {
        user_id: string;
        quiz_date: string;
        score: number;
        total: number;
        answers: (number | null)[];
      };
      queuedAt: string;
    };

const QUEUE_KEY = "stacks-ai-offline-queue";

/** Read the current queue from localStorage */
export function readQueue(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOperation[];
  } catch {
    return [];
  }
}

/** Append an operation to the queue */
export function enqueue(op: Omit<QueuedOperation, "queuedAt">) {
  const queue = readQueue();
  const entry = { ...op, queuedAt: new Date().toISOString() } as QueuedOperation;
  queue.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  console.debug("[OfflineQueue] Enqueued:", entry.type, entry);
}

/** Remove all items from the queue */
function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

/** Replace queue with a new array (for partial flush) */
function saveQueue(queue: QueuedOperation[]) {
  if (queue.length === 0) {
    clearQueue();
  } else {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
}

/**
 * Flush all queued operations to Supabase.
 * Returns the number of successfully flushed items.
 * Failed items remain in the queue for the next flush attempt.
 */
export async function flushQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  console.debug(`[OfflineQueue] Flushing ${queue.length} queued operation(s)…`);

  const remaining: QueuedOperation[] = [];
  let flushed = 0;

  for (const op of queue) {
    try {
      if (op.type === "upsert_topic_progress") {
        const { error } = await supabase.from("topic_progress").upsert(op.payload);
        if (error) throw error;
      } else if (op.type === "upsert_quiz_result") {
        const { error } = await supabase
          .from("daily_quiz_results")
          .upsert(
            {
              user_id: op.payload.user_id,
              quiz_date: op.payload.quiz_date,
              score: op.payload.score,
              total: op.payload.total,
              answers: op.payload.answers,
            },
            { onConflict: "user_id,quiz_date" }
          );
        if (error) throw error;
      }
      flushed++;
      console.debug(`[OfflineQueue] ✓ Flushed ${op.type}`);
    } catch (err) {
      console.warn(`[OfflineQueue] ✗ Failed to flush ${op.type}, keeping in queue:`, err);
      remaining.push(op);
    }
  }

  saveQueue(remaining);
  return flushed;
}

/** How many items are waiting in the queue */
export function queueSize(): number {
  return readQueue().length;
}
