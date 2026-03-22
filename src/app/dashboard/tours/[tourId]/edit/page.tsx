'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params.tourId as string;
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    api.tours
      .get(tourId)
      .then((tour) => {
        setName(tour.name);
        setStartDate(formatDateForInput(tour.startDate));
        setEndDate(formatDateForInput(tour.endDate));
        setFetched(true);
      })
      .catch(() => setError('Failed to load tour'));
  }, [tourId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (startDate && endDate && endDate < startDate) {
      setError('End date cannot be before start date');
      return;
    }
    setLoading(true);
    try {
      await api.tours.update(tourId, {
        name: name.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      router.push(`/dashboard/tours/${tourId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tour');
      setLoading(false);
    }
  }

  if (!fetched && !error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 lg:p-8 pb-8">
        <p className="text-stage-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 lg:p-8 pb-8">
      <Link
        href={`/dashboard/tours/${tourId}`}
        className="inline-flex items-center gap-2 text-stage-muted hover:text-stage-fg mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-xl font-bold text-white mb-6">Edit tour</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Tour name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Oppe På Månen Tour"
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white placeholder-zinc-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
            />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-stage-accent hover:bg-stage-accentHover text-stage-accentFg font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href={`/dashboard/tours/${tourId}`}
            className="py-2.5 px-4 rounded-lg border border-stage-border text-stage-muted hover:text-stage-fg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
