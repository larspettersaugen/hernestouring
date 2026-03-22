'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';
import { api } from '@/lib/api';

export type TaskItem = {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
};

export function TasksContent({
  tourId,
  dateId,
  initialTasks,
  allowEdit,
}: {
  tourId: string;
  dateId: string;
  initialTasks: TaskItem[];
  allowEdit: boolean;
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTitle, setNewTitle] = useState('');
  /** Full-page busy: add task only (avoid blocking every checkbox). */
  const [addBusy, setAddBusy] = useState(false);
  const [togglePending, setTogglePending] = useState<Set<string>>(new Set());
  const [deletePending, setDeletePending] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const openCount = total - doneCount;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && openCount === 0;

  const setTogglePendingMutate = useCallback((taskId: string, on: boolean) => {
    setTogglePending((prev) => {
      const next = new Set(prev);
      if (on) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || addBusy) return;
    setAddBusy(true);
    setError('');
    try {
      const created = await api.dates.tasks.create(tourId, dateId, { title });
      setNewTitle('');
      setTasks((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setAddBusy(false);
    }
  }

  function toggleDone(task: TaskItem) {
    if (!allowEdit || togglePending.has(task.id) || deletePending.has(task.id)) return;
    const next = !task.done;
    const prevDone = task.done;
    setError('');
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: next } : t)));
    setTogglePendingMutate(task.id, true);
    void api.dates.tasks
      .update(tourId, dateId, task.id, { done: next })
      .then(() => {
        setTogglePendingMutate(task.id, false);
      })
      .catch(() => {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: prevDone } : t)));
        setTogglePendingMutate(task.id, false);
        setError('Failed to update');
      });
  }

  function removeTask(taskId: string) {
    if (!allowEdit || addBusy || deletePending.has(taskId)) return;
    const removed = tasks.find((t) => t.id === taskId);
    if (!removed) return;
    setError('');
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeletePending((prev) => new Set(prev).add(taskId));
    void api.dates.tasks
      .delete(tourId, dateId, taskId)
      .then(() => {
        setDeletePending((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      })
      .catch(() => {
        setTasks((prev) => [...prev, removed].sort((a, b) => a.sortOrder - b.sortOrder));
        setDeletePending((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        setError('Failed to delete');
      });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stage-border bg-stage-surface/40 p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-medium text-white">Progress</p>
          <p className={`text-sm font-medium tabular-nums ${allDone ? 'text-emerald-400' : openCount > 0 ? 'text-red-400' : 'text-stage-muted'}`}>
            {total === 0 ? 'No tasks' : allDone ? 'All done' : `${openCount} open · ${doneCount} done`}
          </p>
        </div>
        <div
          className={`h-2.5 rounded-full overflow-hidden border ${
            total === 0
              ? 'bg-stage-surface border-stage-border/80'
              : allDone
                ? 'bg-emerald-950/40 border-emerald-500/30'
                : 'bg-red-950/50 border-red-500/30'
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${total === 0 ? 'bg-stage-border' : 'bg-emerald-500'}`}
            style={{ width: total === 0 ? '0%' : `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        {total > 0 && !allDone && (
          <p className="text-xs text-stage-muted mt-2">Open tasks are highlighted in red until completed.</p>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
              task.done
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-red-500/40 bg-red-500/5'
            }`}
          >
            <div className="shrink-0 pt-0.5">
              {allowEdit ? (
                <button
                  type="button"
                  onClick={() => toggleDone(task)}
                  disabled={togglePending.has(task.id) || deletePending.has(task.id)}
                  aria-pressed={task.done}
                  aria-label={task.done ? 'Mark not done' : 'Mark done'}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                    task.done
                      ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                      : 'border-red-500/50 bg-red-500/10 text-red-300'
                  } ${togglePending.has(task.id) || deletePending.has(task.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-stage-muted'}`}
                >
                  {task.done && <Check className="h-3.5 w-3.5" />}
                </button>
              ) : (
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded border ${
                    task.done
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10'
                  }`}
                  aria-hidden
                >
                  {task.done ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              )}
            </div>
            <p className={`flex-1 text-sm min-w-0 pt-0.5 ${task.done ? 'text-stage-muted line-through' : 'text-white'}`}>{task.title}</p>
            {allowEdit && (
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                disabled={deletePending.has(task.id) || togglePending.has(task.id) || addBusy}
                className="shrink-0 p-1.5 rounded-lg text-stage-muted hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="text-sm text-stage-muted text-center py-6">No tasks for this date yet.{allowEdit ? ' Add reminders below.' : ''}</p>
      )}

      {allowEdit && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stage-border">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Call Jenny, confirm parking…"
            className="flex-1 px-3 py-2.5 rounded-lg bg-stage-surface border border-stage-border text-white placeholder-zinc-500 text-sm"
            disabled={addBusy}
          />
          <button
            type="submit"
            disabled={addBusy || !newTitle.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stage-accent text-stage-accentFg font-medium text-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
        </form>
      )}
    </div>
  );
}
