import type { UniversityFormatId, UniversityTopicId } from '@/types/api';

export const UNIVERSITY_TOPICS: UniversityTopicId[] = [
  'music_education',
  'history_facts',
  'math',
  'language_arts',
  'science',
  'history',
  'technology',
];

export const UNIVERSITY_FORMATS: UniversityFormatId[] = [
  'articles',
  'videos',
  'webinars',
  'conferences',
  'other',
];

export function toggleId<T extends string>(list: T[], id: T, on: boolean): T[] {
  if (on) return list.includes(id) ? list : [...list, id];
  return list.filter((item) => item !== id);
}
