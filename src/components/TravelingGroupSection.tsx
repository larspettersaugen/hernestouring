'use client';

import { Plus, Phone, Mail, ChevronDown, ChevronUp, Users, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PersonPicker } from './PersonPicker';
import { GroupPicker } from './GroupPicker';

const COLLAPSED_LIMIT = 5;

type Member = {
  id: string;
  name: string;
  role: string;
  subgroup: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  personId?: string;
};

function travelingRoleFromPersonType(type: string): string {
  if (type === 'musician' || type === 'superstar') return 'band';
  if (type === 'tour_manager') return 'tour manager';
  if (type === 'productionmanager') return 'production manager';
  if (type === 'driver') return 'driver';
  return 'crew';
}

export function TravelingGroupSection({
  tourId,
  members,
  allowEdit,
}: {
  tourId: string;
  members: Member[];
  allowEdit: boolean;
}) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [addToSubgroup, setAddToSubgroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingCrew, setIsEditingCrew] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  const exceedsLimit = members.length > COLLAPSED_LIMIT;
  const isCollapsed = exceedsLimit && !isExpanded;

  const existingPersonIds = members.map((m) => m.personId).filter(Boolean) as string[];

  async function handleSelect(person: { id: string; name: string; type: string; phone: string | null; email: string | null; notes: string | null } & { role: string }) {
    setError('');
    setLoading(true);
    try {
      await api.travelingGroup.create(tourId, {
        name: person.name,
        role: person.role,
        subgroup: addToSubgroup.trim() || undefined,
        phone: person.phone || undefined,
        email: person.email || undefined,
        notes: person.notes || undefined,
        personId: person.id,
      });
      setShowPicker(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  }

  async function handleSelectMultiple(people: { id: string; name: string; type: string; phone: string | null; email: string | null; notes: string | null; role: string }[]) {
    setError('');
    setLoading(true);
    try {
      for (const person of people) {
        await api.travelingGroup.create(tourId, {
          name: person.name,
          role: person.role,
          subgroup: addToSubgroup.trim() || undefined,
          phone: person.phone || undefined,
          email: person.email || undefined,
          notes: person.notes || undefined,
          personId: person.id,
        });
      }
      setShowPicker(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  }

  function toggleMemberSelection(id: string) {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllMembers() {
    setSelectedMemberIds(new Set(members.map((m) => m.id)));
  }

  function clearMemberSelection() {
    setSelectedMemberIds(new Set());
  }

  const [subgroupForSelected, setSubgroupForSelected] = useState('');

  async function handleRemoveSelected() {
    const ids = Array.from(selectedMemberIds);
    if (ids.length === 0) return;
    setError('');
    setLoading(true);
    try {
      for (const id of ids) {
        await api.travelingGroup.delete(tourId, id);
      }
      setSelectedMemberIds(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
      setLoading(false);
    }
  }

  async function handleSetSubgroupForSelected() {
    const ids = Array.from(selectedMemberIds);
    if (ids.length === 0) return;
    setLoading(true);
    try {
      for (const id of ids) {
        await api.travelingGroup.update(tourId, id, { subgroup: subgroupForSelected.trim() || null });
      }
      setSelectedMemberIds(new Set());
      setSubgroupForSelected('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  }

  async function handleAddGroup(groupId: string, subgroupFilter?: string | null) {
    setError('');
    setLoading(true);
    try {
      const group = await api.groups.get(groupId);
      const exclude = new Set(existingPersonIds);
      let toAdd = group.members.filter((m) => !exclude.has(m.personId));
      if (subgroupFilter != null && subgroupFilter !== '') {
        toAdd = toAdd.filter((m) => (m.subgroup?.trim() || null) === subgroupFilter);
      }
      for (const m of toAdd) {
        const subgroupVal = m.subgroup || addToSubgroup.trim() || undefined;
        await api.travelingGroup.create(tourId, {
          name: m.name,
          role: m.role,
          subgroup: subgroupVal,
          phone: m.phone || undefined,
          email: m.email || undefined,
          personId: m.personId,
        });
      }
      setShowGroupPicker(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="rounded-xl bg-stage-card border border-stage-border overflow-hidden">
        {members.length === 0 && !showPicker ? (
          <div className="p-6 text-center text-stage-muted text-sm">
            No members yet.
            {allowEdit && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stage-accent text-stage-dark font-medium hover:bg-stage-accentHover disabled:opacity-50 text-sm"
                >
                  <Plus className="h-4 w-4" /> Pick from people database
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupPicker(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stage-border text-stage-muted hover:text-white hover:border-stage-accent/50 disabled:opacity-50 text-sm"
                >
                  <Users className="h-4 w-4" /> Add from group
                </button>
              </div>
            )}
          </div>
        ) : isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 flex items-center justify-center gap-2 text-center hover:bg-white/5 transition"
          >
            <span className="font-medium text-white">
              {members.length} {members.length === 1 ? 'person' : 'people'} on this tour
            </span>
            <ChevronDown className="h-4 w-4 text-stage-accent shrink-0" />
          </button>
        ) : (
          <>
            {exceedsLimit && (
              <button
                type="button"
                onClick={() => { setIsExpanded(false); setIsEditingCrew(false); }}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium text-stage-muted hover:text-stage-accent border-b border-stage-border"
              >
                <ChevronUp className="h-4 w-4" /> Collapse
              </button>
            )}
            {allowEdit && members.length > 0 && !isEditingCrew && (
              <div className="py-2 px-4 border-b border-stage-border">
                <button
                  type="button"
                  onClick={() => setIsEditingCrew(true)}
                  className="flex items-center gap-2 text-sm text-stage-muted hover:text-stage-accent"
                >
                  <Pencil className="h-4 w-4" /> Edit crew
                </button>
              </div>
            )}
            {allowEdit && members.length > 0 && isEditingCrew && (
              <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 border-b border-stage-border">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCrew(false)}
                    className="text-sm font-medium py-1.5 px-3 rounded-md border border-stage-border text-white hover:border-stage-accent/50 hover:text-stage-accent transition"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className="text-sm font-medium py-1.5 px-3 rounded-md border border-stage-border text-white hover:border-stage-accent/50 hover:text-stage-accent transition"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearMemberSelection}
                    className="text-sm font-medium py-1.5 px-3 rounded-md border border-stage-border text-white hover:border-stage-accent/50 hover:text-stage-accent transition"
                  >
                    Clear
                  </button>
                  {selectedMemberIds.size > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={subgroupForSelected}
                        onChange={(e) => setSubgroupForSelected(e.target.value)}
                        placeholder="Group name (e.g. Crew, Band)"
                        className="px-2 py-1.5 rounded-md bg-stage-dark border border-stage-border text-white text-sm w-40 placeholder-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={handleSetSubgroupForSelected}
                        disabled={loading}
                        className="text-sm font-medium py-1.5 px-3 rounded-md border border-stage-border text-white hover:border-stage-accent/50 hover:text-stage-accent disabled:opacity-50"
                      >
                        Set group
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveSelected}
                        disabled={loading}
                        className="text-sm font-medium py-1.5 px-3 rounded-md border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Remove selected
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {(() => {
              const bySubgroup = new Map<string | null, Member[]>();
              for (const m of members) {
                const key = m.subgroup?.trim() || null;
                if (!bySubgroup.has(key)) bySubgroup.set(key, []);
                bySubgroup.get(key)!.push(m);
              }
              const subgroupOrder = Array.from(bySubgroup.keys()).sort((a, b) => {
                if (!a) return 1;
                if (!b) return -1;
                return a.localeCompare(b);
              });
              return (
                <div className="max-h-80 min-h-0 overflow-y-auto overscroll-contain">
                <ul
                  className="divide-y divide-stage-border"
                >
                  {subgroupOrder.map((subgroupKey) => {
                    const groupMembers = bySubgroup.get(subgroupKey)!;
                    const groupLabel = subgroupKey || null;
                    return (
                      <li key={groupLabel ?? '__ungrouped__'}>
                        {groupLabel && (
                          <div className="px-4 py-2 bg-stage-dark/50 border-b border-stage-border text-sm font-medium text-stage-muted">
                            {groupLabel}
                          </div>
                        )}
                        {groupMembers.map((m) => (
                          <div key={m.id} className="p-4 flex items-start justify-between gap-2 border-b border-stage-border last:border-b-0">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {allowEdit && isEditingCrew && (
                                <input
                                  type="checkbox"
                                  checked={selectedMemberIds.has(m.id)}
                                  onChange={() => toggleMemberSelection(m.id)}
                                  className="rounded border-stage-border w-4 h-4 mt-0.5 shrink-0 accent-stage-accent"
                                  aria-label={`Select ${m.name}`}
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-white">{m.name}</p>
                                <span className="text-xs text-stage-muted capitalize">{m.role}</span>
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {m.phone && (
                                    <a
                                      href={`tel:${m.phone}`}
                                      className="flex items-center gap-1.5 text-sm text-stage-accent hover:underline"
                                    >
                                      <Phone className="h-3.5 w-3.5" /> {m.phone}
                                    </a>
                                  )}
                                  {m.email && (
                                    <a
                                      href={`mailto:${m.email}`}
                                      className="flex items-center gap-1.5 text-sm text-stage-accent hover:underline"
                                    >
                                      <Mail className="h-3.5 w-3.5" /> {m.email}
                                    </a>
                                  )}
                                </div>
                                {m.notes && <p className="text-sm text-zinc-400 mt-1">{m.notes}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </li>
                    );
                  })}
                </ul>
                </div>
              );
            })()}
          </>
        )}
        {(showPicker || showGroupPicker) && (
          <div className="p-3 border-t border-stage-border">
            <label className="block text-xs text-stage-muted mb-1.5">Add to group (optional)</label>
            <input
              type="text"
              value={addToSubgroup}
              onChange={(e) => setAddToSubgroup(e.target.value)}
              placeholder="e.g. Crew, Band"
              className="w-full px-3 py-2 rounded-lg bg-stage-dark border border-stage-border text-white placeholder-zinc-500 text-sm"
            />
          </div>
        )}
        {showPicker && (
          <PersonPicker
            roleMap={travelingRoleFromPersonType}
            excludePersonIds={existingPersonIds}
            onSelect={handleSelect}
            onSelectMultiple={handleSelectMultiple}
            onCancel={() => { setShowPicker(false); setError(''); }}
          />
        )}
        {showGroupPicker && (
          <GroupPicker
            onSelect={handleAddGroup}
            onCancel={() => { setShowGroupPicker(false); setError(''); }}
          />
        )}
        {error && <p className="p-3 text-red-400 text-sm border-t border-stage-border">{error}</p>}
        {allowEdit && !showPicker && !showGroupPicker && members.length > 0 && (
          <div className="flex border-t border-stage-border">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              disabled={loading}
              className="flex-1 p-3 flex items-center justify-center gap-2 text-stage-muted hover:text-stage-accent disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Pick from people database
            </button>
            <button
              type="button"
              onClick={() => setShowGroupPicker(true)}
              disabled={loading}
              className="flex-1 p-3 flex items-center justify-center gap-2 text-stage-muted hover:text-stage-accent border-l border-stage-border disabled:opacity-50"
            >
              <Users className="h-4 w-4" /> Add from group
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
