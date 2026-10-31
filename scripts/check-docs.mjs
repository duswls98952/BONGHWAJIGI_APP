import { readdir, readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.name.endsWith('.md')) result.push(path);
  }
  return result;
}
const files = ['README.md', 'AGENTS.md', ...await walk('docs')];
const errors = [];
for (const file of files) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1].split('#')[0];
    if (!link || /^https?:/.test(link)) continue;
    try { await access(join(dirname(file), decodeURIComponent(link))); }
    catch { errors.push(`${file}: ${link}`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`문서 ${files.length}개 파일 링크 검사 통과`);
