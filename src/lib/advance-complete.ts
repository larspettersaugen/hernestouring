export type AdvanceDoneFlags = {
  technicalDone: boolean;
  riderDone: boolean;
  logisticsDone: boolean;
  equipmentTransportDone: boolean;
};

/** All four advance checklist "Done" flags are true (compromises don't block). */
export function areAllAdvanceSectionsDone(advance: AdvanceDoneFlags | null): boolean {
  if (!advance) return false;
  return (
    advance.technicalDone &&
    advance.riderDone &&
    advance.logisticsDone &&
    advance.equipmentTransportDone
  );
}

/** Every task is done; dates with zero tasks count as satisfied. */
export function areAllTasksDone(tasks: { done: boolean }[]): boolean {
  if (tasks.length === 0) return true;
  return tasks.every((t) => t.done);
}

export function isReadyForAdvanceComplete(
  advance: AdvanceDoneFlags | null,
  tasks: { done: boolean }[]
): boolean {
  return areAllAdvanceSectionsDone(advance) && areAllTasksDone(tasks);
}
