'use client';

import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function DayNotesSection({
  tourId,
  dateId,
  notes,
  allowEdit,
}: {
  tourId: string;
  dateId: string;
  notes: string | null;
  allowEdit: boolean;
}) {
  const [value, setValue] = useState(notes || '');
  useEffect(() => {
    setValue(notes || '');
  }, [notes]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSave() {
    setError('');
    setLoading(true);
    try {
      await api.dates.update(tourId, dateId, { notes: value || undefined });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4" /> Day notes
      </h2>
      <div className="rounded-xl bg-stage-card border border-stage-border overflow-hidden">
        {allowEdit ? (
          <div className="p-4 space-y-3">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Add notes for this day..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-stage-dark border border-stage-border text-white placeholder-zinc-500 text-sm resize-y min-h-[120px]"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-stage-accent text-stage-dark font-medium disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <div className="p-4">
            {notes ? (
              <p className="text-sm text-white whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="text-sm text-stage-muted">No notes</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
