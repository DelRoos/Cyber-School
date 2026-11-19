/**
 * Deterministic, zero-dependency YAML 1.2 subset parser for Cyber School course sources.
 * Supports: mappings, sequences, nested structures, single/double quoted strings with escapes,
 * literal (|, |-) and folded (>, >-) block scalars, inline flow arrays [a, b], booleans, numbers, null, comments.
 */

export type YamlValue =
  string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

interface RawLine {
  lineNumber: number;
  indent: number;
  content: string;
  raw: string;
}

function stripInlineComment(value: string): string {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inDouble && ch === "\\") {
      escaped = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      if (inSingle && value[i + 1] === "'") {
        i += 1;
        continue;
      }
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === "#" && (i === 0 || /\s/.test(value[i - 1] ?? ""))) {
      return value.slice(0, i).trimEnd();
    }
  }
  return value.trimEnd();
}

function parseDoubleQuoted(raw: string): string {
  let out = "";
  for (let i = 1; i < raw.length - 1; i += 1) {
    const ch = raw[i];
    if (ch === "\\" && i + 1 < raw.length - 1) {
      const next = raw[i + 1];
      i += 1;
      switch (next) {
        case "n":
          out += "\n";
          break;
        case "r":
          out += "\r";
          break;
        case "t":
          out += "\t";
          break;
        case '"':
          out += '"';
          break;
        case "\\":
          out += "\\";
          break;
        default:
          out += next ?? "";
      }
    } else {
      out += ch ?? "";
    }
  }
  return out;
}

function splitFlowItems(inner: string): string[] {
  const items: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  let depth = 0;

  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i] ?? "";
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (inDouble && ch === "\\") {
      current += ch;
      escaped = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      current += ch;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (ch === "[" || ch === "{") depth += 1;
      if (ch === "]" || ch === "}") depth -= 1;
      if (ch === "," && depth === 0) {
        items.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim().length > 0) {
    items.push(current.trim());
  }
  return items;
}

function parseScalar(rawInput: string): YamlValue {
  const trimmed = stripInlineComment(rawInput).trim();
  if (trimmed === "" || trimmed === "null" || trimmed === "~") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return parseDoubleQuoted(trimmed);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitFlowItems(inner).map((item) => parseScalar(item));
  }
  if (trimmed === "{}") return {};
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(1, -1).trim();
    const obj: Record<string, YamlValue> = {};
    for (const pair of splitFlowItems(inner)) {
      const kv = findKeyValueSplit(pair);
      if (kv) {
        obj[kv.key] = parseScalar(kv.rest);
      }
    }
    return obj;
  }
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function findKeyValueSplit(content: string): { key: string; rest: string } | null {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inDouble && ch === "\\") {
      escaped = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === ":") {
      const next = content[i + 1];
      if (next === undefined || next === " " || next === "\t") {
        const rawKey = content.slice(0, i).trim();
        const key =
          (rawKey.startsWith('"') && rawKey.endsWith('"')) ||
          (rawKey.startsWith("'") && rawKey.endsWith("'"))
            ? String(parseScalar(rawKey))
            : rawKey;
        const rest = content.slice(i + 1).trim();
        return { key, rest };
      }
    }
  }
  return null;
}

export function parseYaml(source: string): YamlValue {
  const rawAllLines = source.replace(/^\uFEFF/, "").split(/\r?\n/);

  const meaningful: RawLine[] = [];
  for (let i = 0; i < rawAllLines.length; i += 1) {
    const raw = rawAllLines[i] ?? "";
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed === "---" || trimmed === "...") continue;
    const indent = raw.length - raw.trimStart().length;
    if (raw.slice(0, indent).includes("\t")) {
      throw new Error(`YAML line ${i + 1}: tabs are not allowed for indentation.`);
    }
    meaningful.push({
      lineNumber: i + 1,
      indent,
      content: trimmed,
      raw,
    });
  }

  if (meaningful.length === 0) return {};

  let cursor = 0;

  function readBlockScalar(parentIndent: number, indicator: string): string {
    const isFolded = indicator.startsWith(">");
    const stripTrailing = indicator.endsWith("-");
    const startLineIdx = meaningful[cursor - 1]!.lineNumber; // 1-based next index in rawAllLines
    const blockLines: string[] = [];
    let blockIndent: number | null = null;
    let lastConsumedRawLine = startLineIdx;

    for (let rawIdx = startLineIdx; rawIdx < rawAllLines.length; rawIdx += 1) {
      const line = rawAllLines[rawIdx] ?? "";
      if (line.trim() === "") {
        blockLines.push("");
        lastConsumedRawLine = rawIdx + 1;
        continue;
      }
      const lineIndent = line.length - line.trimStart().length;
      if (lineIndent <= parentIndent) {
        break;
      }
      if (blockIndent === null) {
        blockIndent = lineIndent;
      }
      blockLines.push(line.slice(Math.min(blockIndent, lineIndent)));
      lastConsumedRawLine = rawIdx + 1;
    }

    while (cursor < meaningful.length && meaningful[cursor]!.lineNumber <= lastConsumedRawLine) {
      cursor += 1;
    }

    while (blockLines.length > 0 && blockLines[blockLines.length - 1] === "") {
      blockLines.pop();
    }

    if (!isFolded) {
      const joined = blockLines.join("\n");
      return stripTrailing ? joined.replace(/\n+$/, "") : joined;
    }

    const paragraphs: string[] = [];
    let buf: string[] = [];
    for (const line of blockLines) {
      if (line.trim() === "") {
        if (buf.length > 0) {
          paragraphs.push(buf.join(" "));
          buf = [];
        }
      } else {
        buf.push(line.trim());
      }
    }
    if (buf.length > 0) {
      paragraphs.push(buf.join(" "));
    }
    return paragraphs.join("\n\n");
  }

  function parseNode(expectedIndent: number): YamlValue {
    const line = meaningful[cursor];
    if (!line) return null;
    if (line.content === "-" || line.content.startsWith("- ")) {
      return parseSequence(expectedIndent);
    }
    return parseMapping(expectedIndent);
  }

  function parseSequence(baseIndent: number): YamlValue[] {
    const result: YamlValue[] = [];
    while (cursor < meaningful.length) {
      const line = meaningful[cursor]!;
      if (line.indent < baseIndent) break;
      if (line.indent > baseIndent) {
        throw new Error(`YAML line ${line.lineNumber}: unexpected indentation in sequence.`);
      }
      if (!(line.content === "-" || line.content.startsWith("- "))) {
        break;
      }

      const afterDash = line.content.slice(1).trim();
      cursor += 1;

      if (!afterDash) {
        const next = meaningful[cursor];
        if (!next || next.indent <= baseIndent) {
          result.push(null);
        } else {
          result.push(parseNode(next.indent));
        }
        continue;
      }

      if (afterDash === "|" || afterDash === "|-" || afterDash === ">" || afterDash === ">-") {
        result.push(readBlockScalar(baseIndent, afterDash));
        continue;
      }

      const kv = findKeyValueSplit(afterDash);
      if (kv) {
        const obj: Record<string, YamlValue> = {};
        const itemIndent = baseIndent + 2;
        if (!kv.rest) {
          const next = meaningful[cursor];
          if (next && next.indent > baseIndent) {
            obj[kv.key] = parseNode(next.indent);
          } else {
            obj[kv.key] = null;
          }
        } else if (kv.rest === "|" || kv.rest === "|-" || kv.rest === ">" || kv.rest === ">-") {
          obj[kv.key] = readBlockScalar(baseIndent, kv.rest);
        } else {
          obj[kv.key] = parseScalar(kv.rest);
        }

        while (cursor < meaningful.length) {
          const next = meaningful[cursor]!;
          if (next.indent < itemIndent) break;
          if (next.indent === baseIndent && (next.content === "-" || next.content.startsWith("- ")))
            break;
          const extra = parseMapping(next.indent);
          Object.assign(obj, extra);
          break;
        }
        result.push(obj);
      } else {
        result.push(parseScalar(afterDash));
      }
    }
    return result;
  }

  function parseMapping(baseIndent: number): Record<string, YamlValue> {
    const result: Record<string, YamlValue> = {};
    while (cursor < meaningful.length) {
      const line = meaningful[cursor]!;
      if (line.indent < baseIndent) break;
      if (line.indent > baseIndent) {
        throw new Error(`YAML line ${line.lineNumber}: unexpected indentation in mapping.`);
      }
      if (line.content === "-" || line.content.startsWith("- ")) {
        break;
      }

      const kv = findKeyValueSplit(line.content);
      if (!kv) {
        throw new Error(
          `YAML line ${line.lineNumber}: expected 'key: value', got '${line.content}'.`,
        );
      }

      cursor += 1;
      if (!kv.rest) {
        const next = meaningful[cursor];
        if (!next || next.indent <= baseIndent) {
          result[kv.key] = null;
        } else {
          result[kv.key] = parseNode(next.indent);
        }
      } else if (kv.rest === "|" || kv.rest === "|-" || kv.rest === ">" || kv.rest === ">-") {
        result[kv.key] = readBlockScalar(baseIndent, kv.rest);
      } else {
        result[kv.key] = parseScalar(kv.rest);
      }
    }
    return result;
  }

  return parseNode(meaningful[0]!.indent);
}
