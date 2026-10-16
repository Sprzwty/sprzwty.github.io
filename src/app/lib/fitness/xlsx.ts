/** Minimal dependency-free .xlsx reader: returns the first worksheet as a 2D array of cell values.
 * Supports what spreadsheet exports actually emit (stored/deflated zip entries, shared + inline strings).
 * Runs unchanged in browsers and Node ≥ 22 (native DecompressionStream('deflate-raw'), no DOMParser). */

export type CellValue = string | number | null;

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const LOCAL_HEADER_SIZE = 30;
const COMPRESSION_STORED = 0;
const COMPRESSION_DEFLATE = 8;

interface ZipEntry {
  method: number;
  compressedSize: number;
  localHeaderOffset: number;
}

function readCentralDirectory(buf: ArrayBuffer): Map<string, ZipEntry> {
  const view = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === EOCD_SIGNATURE) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a valid .xlsx (zip) file');

  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries = new Map<string, ZipEntry>();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== CENTRAL_DIR_SIGNATURE) throw new Error('Corrupt zip central directory');
    const method = view.getUint16(p + 10, true);
    const compressedSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localHeaderOffset = view.getUint32(p + 42, true);
    const name = decoder.decode(new Uint8Array(buf, p + 46, nameLen));
    entries.set(name, { method, compressedSize, localHeaderOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function readEntryText(buf: ArrayBuffer, entry: ZipEntry): Promise<string> {
  const view = new DataView(buf);
  const o = entry.localHeaderOffset;
  const start = o + LOCAL_HEADER_SIZE + view.getUint16(o + 26, true) + view.getUint16(o + 28, true);
  const raw = new Uint8Array(buf, start, entry.compressedSize);
  if (entry.method === COMPRESSION_STORED) return new TextDecoder().decode(raw);
  if (entry.method !== COMPRESSION_DEFLATE) throw new Error(`Unsupported zip compression method ${entry.method}`);
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => {
    if (e[0] !== '#') return XML_ENTITIES[e] ?? m;
    return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
  });
}

function attr(attrs: string, name: string): string | null {
  return attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;
}

/** Concatenated text of every <t> run (plain and rich-text strings). */
function textRuns(xml: string): string {
  return decodeXml([...xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(''));
}

/** "AB12" -> 27 (0-based column index). */
function columnIndex(ref: string): number {
  let col = 0;
  for (const ch of ref) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) break;
    col = col * 26 + (code - 64);
  }
  return col - 1;
}

export async function readFirstSheet(buf: ArrayBuffer): Promise<CellValue[][]> {
  const entries = readCentralDirectory(buf);

  const sheetName = [...entries.keys()]
    .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))[0];
  if (!sheetName) throw new Error('No worksheet found in .xlsx');

  const sharedEntry = entries.get('xl/sharedStrings.xml');
  const shared = sharedEntry
    ? [...(await readEntryText(buf, sharedEntry)).matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((m) => textRuns(m[1]))
    : [];

  const sheet = await readEntryText(buf, entries.get(sheetName)!);
  const rows: CellValue[][] = [];
  for (const rm of sheet.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const row: CellValue[] = [];
    for (const cm of (rm[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const type = attr(cm[1], 't');
      const body = cm[2] ?? '';
      const v = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? null;
      let value: CellValue = null;
      if (type === 's') value = v === null ? null : shared[Number(v)] ?? null;
      else if (type === 'inlineStr') value = textRuns(body);
      else if (type === 'str' || type === 'e') value = v === null ? null : decodeXml(v);
      else if (v !== null) value = Number(v);
      const ref = attr(cm[1], 'r');
      row[ref ? columnIndex(ref) : row.length] = value;
    }
    const r = attr(rm[1], 'r');
    rows[r ? Number(r) - 1 : rows.length] = Array.from(row, (x) => x ?? null);
  }
  return Array.from(rows, (r) => r ?? []);
}
