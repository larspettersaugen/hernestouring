'use client';

import { Plus, Pencil, Search, Trash2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export type VenueRow = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  notes: string | null;
};

export function VenuesContent({
  initialVenues,
  allowEdit,
}: {
  initialVenues: VenueRow[];
  allowEdit: boolean;
}) {
  const [venues, setVenues] = useState<VenueRow[]>(initialVenues);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setVenues(initialVenues);
  }, [initialVenues]);

  const filtered = venues.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q) ||
      (v.address?.toLowerCase().includes(q) ?? false)
    );
  });

  function resetForm() {
    setName('');
    setCity('');
    setAddress('');
    setNotes('');
    setError('');
    setAdding(false);
    setEditing(null);
  }

  async function refreshList() {
    const list = await api.venues.list();
    setVenues(list);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.venues.create({
        name: name.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      await refreshList();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    setLoading(true);
    try {
      await api.venues.update(editing, {
        name: name.trim(),
        city: city.trim(),
        address: address.trim() || null,
        notes: notes.trim() || null,
      });
      await refreshList();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this venue from the list?')) return;
    setError('');
    try {
      await api.venues.delete(id);
      await refreshList();
      if (editing === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  function startEdit(v: VenueRow) {
    setEditing(v.id);
    setName(v.name);
    setCity(v.city);
    setAddress(v.address || '');
    setNotes(v.notes || '');
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stage-muted">
        Reference list of places you play or might play. Tour dates still use their own venue and city fields.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stage-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by venue, city, address…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-stage-card border border-stage-border text-white placeholder-zinc-500"
          />
        </div>
        {allowEdit && !adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stage-accent text-stage-accentFg font-medium hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add venue
          </button>
        )}
      </div>

      {(adding || editing) && (
        <form
          onSubmit={editing ? handleUpdate : handleAdd}
          className="rounded-xl bg-stage-card border border-stage-border p-4 space-y-3"
        >
          <h3 className="text-sm font-medium text-white">{editing ? 'Edit venue' : 'New venue'}</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Venue name"
            className="w-full px-3 py-2 rounded-lg bg-stage-surface border border-stage-border text-white placeholder-zinc-500"
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="City"
            className="w-full px-3 py-2 rounded-lg bg-stage-surface border border-stage-border text-white placeholder-zinc-500"
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="w-full px-3 py-2 rounded-lg bg-stage-surface border border-stage-border text-white placeholder-zinc-500"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (capacity, load-in, etc.)"
            className="w-full px-3 py-2 rounded-lg bg-stage-surface border border-stage-border text-white placeholder-zinc-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-stage-accent text-stage-accentFg font-medium disabled:opacity-50"
            >
              {loading ? 'Saving…' : editing ? 'Save' : 'Add'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-stage-border text-stage-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!adding && !editing && error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="rounded-xl bg-stage-card border border-stage-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-stage-muted text-sm">
            {venues.length === 0 ? 'No venues yet' : 'No matches'}
          </div>
        ) : (
          <ul className="divide-y divide-stage-border">
            {filtered.map((v) => (
              <li key={v.id} className="p-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-white">{v.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-stage-muted mt-0.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {v.city}
                  </p>
                  {v.address && <p className="text-sm text-zinc-400 mt-1">{v.address}</p>}
                  {v.notes && <p className="text-sm text-zinc-400 mt-1">{v.notes}</p>}
                </div>
                {allowEdit && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(v)}
                      className="p-1.5 rounded text-stage-muted hover:text-stage-accent hover:bg-stage-surface"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded text-stage-muted hover:text-red-400 hover:bg-stage-surface"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
