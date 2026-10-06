'use client';

import { useState, type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';

const DEFINITIONS: Record<string, string> = {
  'generative ai': 'Software that creates new writing or images from a request, instead of only looking up a stored answer.',
  chatbot: 'An AI tool you type to in a chat window.',
  prompt: 'The request you type into an AI tool.',
  'language model': 'An AI program that learned patterns from lots of writing and uses them to build a reply one piece at a time.',
  hallucination: 'When an AI tool gives an answer that sounds confident but is false or made up.',
  'rephrasing and reformatting': 'Changing the wording or layout of something while keeping its main meaning.',
  'generating variations': 'Making several different versions of the same idea, question, or activity.',
  'organizing a first draft': 'Turning rough ideas into a starting outline or plan that you can review and improve.',
  'differentiating a worksheet': 'Changing a worksheet so students with different reading or skill levels can all use it.',
  'generating discussion questions': 'Creating questions that help students remember, explain, compare, or apply ideas.',
  'drafting a first-pass rubric': 'Creating a starting list of what good work should include before you adjust it for your class.',
  'writing multiple versions of instructions': 'Explaining the same task in different ways so more students can understand it.',
  'personally identifiable information (PII)': 'Details that could identify a real student, such as a name, grades, IEP notes, or a student number.',
  'academic integrity': 'Being honest about whose thinking and work are in an assignment.',
  'AI-detection software': 'A tool that claims to identify writing made by AI; its results can be wrong and should not be treated as proof.',
  'AI-detection tools': 'Tools that claim to identify writing made by AI; their results can be wrong and should not be treated as proof.',
  'ask for process, not just product': 'Ask students to show steps such as planning and drafting, not only the finished assignment.',
  'bring some assessment in-class': 'Include some work done with the teacher present so students can explain their own thinking.',
  "AI predicts plausible text — it doesn't know things the way a person does.": 'AI can produce an answer that sounds right without truly knowing whether it is correct.',
  'the lowest-risk starting point is your own planning time': 'Begin with work students will not see directly, and review the result before using it.',
  'never put student personal information into a general-purpose AI tool': 'Do not enter student names, grades, IEP details, or other private information into a public chatbot.',
  'set explicit, discussed expectations around AI and academic integrity': 'Tell students clearly when AI help is allowed, when it is not, and what to do when they are unsure.',
  'repeated confusion on the same concept': 'A student keeps making or asking about the same mistake and may need direct teaching.',
  'signs of disengagement': 'Responses or behavior suggesting that a student is distracted, guessing, or no longer participating.',
  'anything that should have been escalated': 'A concern serious enough to report through the school’s safety or support process.',
  'school hub': 'The part of WLKR where students open lessons assigned by their school.',
  'WLKR central': 'The part of WLKR where students access home activities and explore their personal learning space.',
  'context': 'Who the work is for and why, such as a grade level, subject, or situation.',
  'task': 'The specific action you want the AI tool to take, such as write, summarize, or generate.',
  'format': 'The shape you want the answer to have, such as a list, table, or short paragraph.',
  'constraints': 'Instructions about what to include, leave out, or keep within a limit.',
  'examples': 'Samples that show the AI tool the style or structure you want.',
};

const REFERENCES: [string, string][] = [
  ['Microsoft Copilot', 'https://copilot.microsoft.com'],
  ['Brisk Teaching', 'https://www.briskteaching.com'],
  ['Khan Academy', 'https://www.khanacademy.org'],
  ['MagicSchool', 'https://www.magicschool.ai'],
  ['Khanmigo', 'https://www.khanmigo.ai'],
  ['ChatGPT', 'https://chatgpt.com'],
  ['OpenAI', 'https://openai.com'],
  ['Anthropic', 'https://www.anthropic.com'],
  ['Claude', 'https://claude.ai'],
  ['Gemini', 'https://gemini.google.com'],
  ['Copilot', 'https://copilot.microsoft.com'],
  ['Wikipedia', 'https://www.wikipedia.org'],
  ['YouTube', 'https://www.youtube.com'],
  ['Canva', 'https://www.canva.com'],
  ['Diffit', 'https://web.diffit.me'],
  ['Clever', 'https://www.clever.com'],
  ['SchoolAI', 'https://schoolai.com'],
  ['Curipod', 'https://curipod.com'],
];

const REFERENCE_SOURCE = REFERENCES.map(([name]) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

function definitionFor(term: string) {
  return DEFINITIONS[term.toLowerCase()] ?? null;
}

function safeReferenceUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function referenceUrlFor(name: string) {
  const found = REFERENCES.find(([label]) => label.toLowerCase() === name.toLowerCase());
  return found?.[1] ?? null;
}

function ReferenceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-semibold text-brand-700 underline decoration-solid underline-offset-2 hover:text-brand-900 dark:text-brand-300 dark:hover:text-brand-200"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="sr-only"> (opens in a new window)</span>
    </a>
  );
}

function linkKey(href: string) {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/$/, '') || '/';
    return `${url.host.toLowerCase()}${path}${url.search}`;
  } catch {
    return href.toLowerCase();
  }
}

function linkOnce(href: string, link: ReactNode, seenLinks: Set<string>) {
  const key = linkKey(href);
  if (seenLinks.has(key)) return null;
  seenLinks.add(key);
  return link;
}

function renderRichText(text: string, keyPrefix: string, seenLinks: Set<string>): ReactNode[] {
  const pattern = new RegExp(
    [
      '\\[([^\\]]+)\\]\\((https?:\\/\\/[^)\\s]+)\\)',
      `\\b(?:${REFERENCE_SOURCE})\\b`,
      'https?:\\/\\/[^\\s)]+',
    ].join('|'),
    'gi',
  );
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    const [full, label, markdownUrl] = match;
    if (label && markdownUrl) {
      const href = safeReferenceUrl(markdownUrl);
      const linked = href ? linkOnce(href, <ReferenceLink key={`${keyPrefix}-${index}`} href={href}>{label}</ReferenceLink>, seenLinks) : null;
      nodes.push(linked ?? label);
    } else if (/^https?:\/\//i.test(full)) {
      const href = safeReferenceUrl(full.replace(/[.,;:]+$/, ''));
      const linked = href ? linkOnce(href, <ReferenceLink key={`${keyPrefix}-${index}`} href={href}>{full}</ReferenceLink>, seenLinks) : null;
      nodes.push(linked ?? full);
    } else {
      const href = referenceUrlFor(full);
      const linked = href ? linkOnce(href, <ReferenceLink key={`${keyPrefix}-${index}`} href={href}>{full}</ReferenceLink>, seenLinks) : null;
      nodes.push(linked ?? full);
    }
    cursor = index + full.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function DefinitionTerm({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const definition = definitionFor(term);

  if (!definition) return <strong>{term}</strong>;

  return (
    <span className="group relative inline">
      <button
        type="button"
        className="font-bold text-brand-700 underline decoration-dotted underline-offset-2 hover:text-brand-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300 dark:hover:text-brand-200"
        aria-expanded={open}
        aria-label={`Definition of ${term}`}
        onClick={() => setOpen((current) => !current)}
      >
        {term}
      </button>
      <span
        role="tooltip"
        className={[
          'absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg border border-brand-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-gray-700 shadow-lg',
          'dark:border-brand-800 dark:bg-gray-900 dark:text-gray-200',
          open ? 'block' : 'hidden group-hover:block group-focus-within:block',
        ].join(' ')}
      >
        {definition}
      </span>
    </span>
  );
}

export function LessonBody({ body }: { body: string }) {
  const parts = body.split(/(\*\*[^*]+\*\*)/g);
  const seenLinks = new Set<string>();

  return (
    <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {parts.map((part, index) => {
        if (!part.startsWith('**') || !part.endsWith('**')) {
          return <span key={index}>{renderRichText(part, String(index), seenLinks)}</span>;
        }
        const term = part.slice(2, -2);
        return definitionFor(term)
          ? <DefinitionTerm key={index} term={term} />
          : <span key={index}>{renderRichText(term, String(index), seenLinks)}</span>;
      })}
    </div>
  );
}
