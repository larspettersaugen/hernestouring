'use client';

export function PrintDaySheetButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm text-stage-accent hover:underline print:hidden"
    >
      Print day sheet
    </button>
  );
}
