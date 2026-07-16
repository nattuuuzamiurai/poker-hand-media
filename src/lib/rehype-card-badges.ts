// Markdown本文中の「A♠」のようなカード表記を自動検出し、
// 色分けされたカードバッジ(<span class="card-badge ...">)に変換するrehypeプラグイン。
//
// 執筆側(コンテンツ制作部)は新しい記法を覚える必要はない。これまで通り本文に
// 「A♠」「K♠K♥7♦」のようにランク+スート記号を続けて書くだけで、見出し・段落・
// テーブルのどこであっても自動的にバッジ表示になる(astro.config.mjs に登録)。
//
// 見た目のCSS(`.card-badge` 等)は `src/styles/global.css` 側で定義する
// (Astroのスコープ付き<style>は `render()` 経由で注入される本文HTMLには
// 効かないため。SourceList等ではなくグローバルCSSに置く理由は同じ)。
//
// 対象はスート記号(♠♥♦♣)付きの表記のみ(誤検出防止のため)。
// コードブロック/インラインコード(<code>)内は変換対象外とする。
import { visit } from 'unist-util-visit';
import type { Element, Root, RootContent, Text } from 'hast';
import { CARD_TEXT_PATTERN, suitSymbolColorClass } from './cards';

function buildCardBadge(rank: string, suitSymbol: string): Element {
	return {
		type: 'element',
		tagName: 'span',
		properties: { className: ['card-badge', suitSymbolColorClass(suitSymbol)] },
		children: [
			{ type: 'text', value: rank },
			{
				type: 'element',
				tagName: 'span',
				properties: { className: ['card-badge__suit'], ariaHidden: 'true' },
				children: [{ type: 'text', value: suitSymbol }],
			},
		],
	};
}

export default function rehypeCardBadges() {
	return (tree: Root) => {
		visit(tree, 'text', (node: Text, index, parent) => {
			if (index === undefined || index === null || !parent) return;
			if (parent.type === 'element' && (parent as Element).tagName === 'code') return;

			const value = node.value;
			CARD_TEXT_PATTERN.lastIndex = 0;
			if (!CARD_TEXT_PATTERN.test(value)) return;
			CARD_TEXT_PATTERN.lastIndex = 0;

			const replacement: RootContent[] = [];
			let lastIndex = 0;
			let match: RegExpExecArray | null;
			// eslint-disable-next-line no-cond-assign
			while ((match = CARD_TEXT_PATTERN.exec(value))) {
				const [full, rank, suitSymbol] = match;
				if (match.index > lastIndex) {
					replacement.push({ type: 'text', value: value.slice(lastIndex, match.index) });
				}
				replacement.push(buildCardBadge(rank, suitSymbol));
				lastIndex = match.index + full.length;
			}
			if (lastIndex < value.length) {
				replacement.push({ type: 'text', value: value.slice(lastIndex) });
			}

			parent.children.splice(index, 1, ...replacement);
			// 挿入した分だけ次の走査位置を進める(同じテキストの再走査を避ける)。
			return index + replacement.length;
		});
	};
}
