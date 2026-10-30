import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index} className="font-semibold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function blocks(source: string): string[][] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out: string[][] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.some((line) => line.trim())) out.push(current);
    current = [];
  };
  for (const line of lines) {
    if (!line.trim()) {
      flush();
      continue;
    }
    if (/^#{1,3} /.test(line) && current.length) flush();
    current.push(line);
    if (/^#{1,3} /.test(line)) flush();
  }
  flush();
  return out;
}

export function BlogMarkdown({ source }: { source: string }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
      {blocks(source).map((block, index) => {
        const first = block[0].trim();
        if (first.startsWith('### ')) {
          return <h3 key={index} className="font-heading text-xl font-semibold text-gray-900 dark:text-gray-100">{inline(first.slice(4))}</h3>;
        }
        if (first.startsWith('## ')) {
          return <h2 key={index} className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{inline(first.slice(3))}</h2>;
        }
        if (first.startsWith('# ')) {
          return <h2 key={index} className="font-heading text-2xl font-semibold text-gray-900 dark:text-gray-100">{inline(first.slice(2))}</h2>;
        }
        if (block.every((line) => /^\s*[-*] /.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-1 ps-5">
              {block.map((line, lineIndex) => (
                <li key={lineIndex}>{inline(line.replace(/^\s*[-*] /, ''))}</li>
              ))}
            </ul>
          );
        }
        if (block.every((line) => /^\s*\d+\. /.test(line))) {
          return (
            <ol key={index} className="list-decimal space-y-1 ps-5">
              {block.map((line, lineIndex) => (
                <li key={lineIndex}>{inline(line.replace(/^\s*\d+\. /, ''))}</li>
              ))}
            </ol>
          );
        }
        return <p key={index}>{inline(block.join(' '))}</p>;
      })}
    </div>
  );
}
