'use client';

import { Users, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Group = {
  id: string;
  name: string;
  memberCount: number;
};

type GroupMember = {
  id: string;
  personId: string;
  name: string;
  type: string;
  phone: string | null;
  email: string | null;
  role: string;
  subgroup: string | null;
};

export function GroupPicker({
  onSelect,
  onCancel,
}: {
  onSelect: (groupId: string, subgroupFilter?: string | null) => void;
  onCancel: () => void;
  excludePersonIds?: string[];
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    api.groups.list().then(setGroups).finally(() => setLoading(false));
  }, []);

  async function selectGroup(g: Group) {
    setSelectedGroup({ id: g.id, name: g.name });
    setLoadingMembers(true);
    try {
      const group = await api.groups.get(g.id);
      setGroupMembers(group.members);
    } finally {
      setLoadingMembers(false);
    }
  }

  const subgroups = Array.from(
    new Set(groupMembers.map((m) => m.subgroup?.trim()).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="p-4 border-t border-stage-border space-y-3">
      {selectedGroup ? (
        <>
          <button
            type="button"
            onClick={() => { setSelectedGroup(null); setGroupMembers([]); }}
            className="flex items-center gap-1.5 text-sm text-stage-muted hover:text-stage-fg"
          >
            <ChevronLeft className="h-4 w-4" /> Back to groups
          </button>
          <p className="text-xs text-stage-muted">
            Add from <span className="text-white font-medium">{selectedGroup.name}</span>
          </p>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-stage-border divide-y divide-stage-border">
            {loadingMembers ? (
              <div className="p-4 text-center text-stage-muted text-sm">Loading...</div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect(selectedGroup.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-stage-surface"
                >
                  <div className="p-2 rounded-lg bg-stage-accent/20 shrink-0">
                    <Users className="h-4 w-4 text-stage-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">Add all ({groupMembers.length} people)</p>
                  </div>
                </button>
                {subgroups.map((sg) => {
                  const count = groupMembers.filter((m) => (m.subgroup?.trim() || null) === sg).length;
                  return (
                    <button
                      key={sg}
                      type="button"
                      onClick={() => onSelect(selectedGroup.id, sg)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-stage-surface"
                    >
                      <div className="p-2 rounded-lg bg-stage-surface shrink-0">
                        <Users className="h-4 w-4 text-stage-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{sg}</p>
                        <p className="text-xs text-stage-muted">
                          {count} {count === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-stage-muted">Add group or subgroup to tour</p>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-stage-border divide-y divide-stage-border">
            {loading ? (
              <div className="p-4 text-center text-stage-muted text-sm">Loading...</div>
            ) : groups.length === 0 ? (
              <div className="p-4 text-center text-stage-muted text-sm">
                No groups yet. Create groups in People → Groups.
              </div>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => selectGroup(g)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-stage-surface"
                >
                  <div className="p-2 rounded-lg bg-stage-accent/20 shrink-0">
                    <Users className="h-4 w-4 text-stage-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{g.name}</p>
                    <p className="text-xs text-stage-muted">
                      {g.memberCount} {g.memberCount === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
      <button type="button" onClick={onCancel} className="text-sm text-stage-muted hover:text-stage-fg">
        Cancel
      </button>
    </div>
  );
}
