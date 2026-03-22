'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { SHOW_STATUSES } from '@/lib/show-status';
import { DATE_KINDS } from '@/lib/date-kind';

export default function NewDatePage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params.tourId as string;
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kind, setKind] = useState('concert');
  const [status, setStatus] = useState('confirmed');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.dates.create(tourId, {
        venueName,
        city,
        date,
        kind,
        status,
        address,
        ...((kind === 'preproduction' || kind === 'rehearsal') && endDate ? { endDate } : {}),
      });
      router.push(`/dashboard/tours/${tourId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add date');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 lg:p-8 pb-8">
      <Link
        href={`/dashboard/tours/${tourId}`}
        className="inline-flex items-center gap-2 text-stage-muted hover:text-stage-fg mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dates
      </Link>
      <h1 className="text-xl font-bold text-white mb-6">Add show date</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
            placeholder="e.g. Rock Club"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Category</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
          >
            {DATE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
            placeholder="e.g. Oslo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
          />
        </div>
        {(kind === 'preproduction' || kind === 'rehearsal') && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={date}
              className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
          >
            {SHOW_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Address (optional)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white"
            placeholder="Venue address"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-stage-accent hover:bg-stage-accentHover text-stage-accentFg font-semibold disabled:opacity-50"
          >
            {loading ? 'Adding…' : 'Add date'}
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
