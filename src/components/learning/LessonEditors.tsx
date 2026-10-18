'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { LessonEditor } from '@/types/api';

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

export function LessonEditors({ editors }: { editors?: LessonEditor[] }) {
  const t = useTranslations('app.course');
  const [selected, setSelected] = useState<LessonEditor | null>(null);
  const people = editors || [];
  if (!people.length) return null;

  return (
    <div className="mt-10 border-t border-gray-100 pt-6 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('editors')}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {people.map((editor) => (
          <button
            key={editor.userId}
            type="button"
            onClick={() => setSelected(editor)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-800 hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:text-brand-300"
          >
            {editor.name}
          </button>
        ))}
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? t('editsBy', { name: selected.name }) : t('editors')}</DialogTitle>
          </DialogHeader>
          <ul className="mt-4 space-y-3">
            {(selected?.edits || []).map((edit, index) => (
              <li key={`${edit.at}-${index}`} className="text-sm text-gray-700 dark:text-gray-200">
                <p>{edit.summary}</p>
                {edit.at ? <p className="text-xs text-gray-500">{when(edit.at)}</p> : null}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
