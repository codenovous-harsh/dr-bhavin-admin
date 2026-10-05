import { Link, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import type {
  List,
  ListItem,
  Nodes,
  PhrasingContent,
  Root,
  RootContent,
  Table
} from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';

/**
 * Report markdown → react-pdf elements.
 *
 * The reports are Markdown written by the model: ### section headings, bold-led
 * paragraphs, bullet and numbered lists, --- dividers, and in Tier 2 a GFM
 * table (the sub-score rubric). Parsed to an mdast tree rather than rendered
 * via HTML, because react-pdf draws its own primitives and has no HTML layer.
 * Anything outside that set degrades to its plain text rather than vanishing.
 */

export const BRAND = '#0e7a63';
const INK = '#1f2933';
const MUTED = '#5f6b76';
const RULE = '#d9e2e0';
const TINT = '#eef6f4';

export const md = StyleSheet.create({
  h1: {
    fontSize: 16,
    fontWeight: 700,
    color: INK,
    marginTop: 14,
    marginBottom: 6
  },
  h2: {
    fontSize: 14,
    fontWeight: 700,
    color: INK,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: RULE
  },
  h3: {
    fontSize: 11.5,
    fontWeight: 700,
    color: BRAND,
    marginTop: 14,
    marginBottom: 5
  },
  h4: {
    fontSize: 10.5,
    fontWeight: 600,
    color: INK,
    marginTop: 10,
    marginBottom: 4
  },
  // fontSize sits beside lineHeight on purpose: react-pdf resolves a unitless
  // lineHeight against the fontSize in the same style, and without one here
  // paragraphs came out roughly double-spaced.
  p: { marginBottom: 6, fontSize: 10, lineHeight: 1.45 },
  tightP: { marginBottom: 2, fontSize: 10, lineHeight: 1.45 },
  list: { marginBottom: 6 },
  item: { flexDirection: 'row', marginBottom: 3 },
  marker: { width: 14, color: MUTED, fontSize: 10, lineHeight: 1.45 },
  itemBody: { flex: 1 },
  hr: { borderBottomWidth: 1, borderBottomColor: RULE, marginVertical: 10 },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: BRAND,
    paddingLeft: 8,
    marginBottom: 6,
    color: MUTED
  },
  code: { fontFamily: 'Courier', fontSize: 9 },
  codeBlock: {
    fontFamily: 'Courier',
    fontSize: 8.5,
    backgroundColor: TINT,
    padding: 6,
    marginBottom: 6
  },
  table: { borderWidth: 1, borderColor: RULE, marginBottom: 8 },
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: RULE },
  headRow: { flexDirection: 'row', backgroundColor: TINT },
  cell: { padding: 4, fontSize: 8.5, lineHeight: 1.35 },
  headCell: { padding: 4, fontSize: 8.5, fontWeight: 700, lineHeight: 1.35 },
  strong: { fontWeight: 700 },
  em: { fontStyle: 'italic' },
  link: { color: BRAND, textDecoration: 'underline' }
});

export function parseMarkdown(markdown: string): Root {
  return fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });
}

function plainText(node: Nodes): string {
  if ('value' in node && typeof node.value === 'string') return node.value;
  if ('children' in node)
    return (node.children as Nodes[]).map(plainText).join('');
  return '';
}

function renderInline(
  nodes: PhrasingContent[],
  keyPrefix: string
): ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (node.type) {
      case 'text':
        return node.value;
      case 'strong':
        return (
          <Text key={key} style={md.strong}>
            {renderInline(node.children, key)}
          </Text>
        );
      case 'emphasis':
        return (
          <Text key={key} style={md.em}>
            {renderInline(node.children, key)}
          </Text>
        );
      case 'delete':
        return (
          <Text key={key} style={{ textDecoration: 'line-through' }}>
            {renderInline(node.children, key)}
          </Text>
        );
      case 'inlineCode':
        return (
          <Text key={key} style={md.code}>
            {node.value}
          </Text>
        );
      case 'break':
        return '\n';
      case 'link':
        return (
          <Link key={key} src={node.url} style={md.link}>
            {renderInline(node.children, key)}
          </Link>
        );
      default:
        return plainText(node as Nodes);
    }
  });
}

/**
 * Column widths from content length, so the rubric table's long "reasoning"
 * column gets the room instead of three equal thirds. Clamped so a short
 * column is still wide enough for its header.
 */
function columnWeights(table: Table): number[] {
  const cols = Math.max(...table.children.map((r) => r.children.length));
  const weights = Array.from({ length: cols }, (_, c) => {
    const longest = Math.max(
      ...table.children.map((r) =>
        r.children[c] ? plainText(r.children[c]).length : 0
      )
    );
    return Math.min(Math.max(longest, 14), 120);
  });
  return weights;
}

function renderTable(table: Table, key: string) {
  const weights = columnWeights(table);
  return (
    <View key={key} style={md.table}>
      {table.children.map((row, r) => (
        // A row is never split across pages — half a rubric line reads as a
        // different score.
        <View
          key={`${key}-r${r}`}
          style={r === 0 ? md.headRow : md.row}
          wrap={false}
        >
          {weights.map((w, c) => (
            <View key={`${key}-r${r}c${c}`} style={{ flex: w }}>
              <Text style={r === 0 ? md.headCell : md.cell}>
                {row.children[c]
                  ? renderInline(row.children[c].children, `${key}-${r}-${c}`)
                  : ''}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function renderList(list: List, key: string, depth: number) {
  const start = list.start ?? 1;
  return (
    <View
      key={key}
      style={[md.list, depth > 0 ? { marginLeft: 12, marginBottom: 0 } : {}]}
    >
      {list.children.map((item: ListItem, i) => (
        // Kept whole across a page break, so a bullet is never left at the
        // foot of one page with its text starting the next.
        <View key={`${key}-${i}`} style={md.item} wrap={false}>
          <Text style={md.marker}>{list.ordered ? `${start + i}.` : '•'}</Text>
          <View style={md.itemBody}>
            {item.children.map((child, j) =>
              renderBlock(child, `${key}-${i}-${j}`, depth + 1, true)
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function renderBlock(
  node: RootContent,
  key: string,
  depth = 0,
  tight = false
): ReactNode {
  switch (node.type) {
    case 'heading': {
      const style =
        node.depth === 1
          ? md.h1
          : node.depth === 2
            ? md.h2
            : node.depth === 3
              ? md.h3
              : md.h4;
      // minPresenceAhead keeps a heading from being stranded at the foot of a
      // page with its section starting on the next.
      return (
        <Text key={key} style={style} minPresenceAhead={90}>
          {renderInline(node.children, key)}
        </Text>
      );
    }
    case 'paragraph':
      return (
        <Text key={key} style={tight ? md.tightP : md.p}>
          {renderInline(node.children, key)}
        </Text>
      );
    case 'list':
      return renderList(node, key, depth);
    case 'table':
      return renderTable(node, key);
    case 'thematicBreak':
      return <View key={key} style={md.hr} />;
    case 'blockquote':
      return (
        <View key={key} style={md.quote}>
          {node.children.map((c, i) => renderBlock(c, `${key}-${i}`, depth))}
        </View>
      );
    case 'code':
      return (
        <Text key={key} style={md.codeBlock}>
          {node.value}
        </Text>
      );
    case 'html':
      return null;
    default: {
      const text = plainText(node as Nodes);
      return text ? (
        <Text key={key} style={md.p}>
          {text}
        </Text>
      ) : null;
    }
  }
}

export function MarkdownPdf({
  markdown,
  keyPrefix = 'md'
}: {
  markdown: string;
  keyPrefix?: string;
}) {
  const tree = parseMarkdown(markdown);
  return (
    <>
      {tree.children.map((node, i) => renderBlock(node, `${keyPrefix}-${i}`))}
    </>
  );
}
