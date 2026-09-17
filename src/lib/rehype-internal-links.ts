// 記事本文(Markdown)中のサイト内リンク(<a href="/articles/...">等)に、
// astro.config.mjsの`base`設定を自動的に補完するrehypeプラグイン。
//
// 背景: `base`設定はコンポーネント側の`withBase()`(src/lib/base-url.ts)経由で
// 組み立てたリンク・アセットパスにしか反映されない。本文Markdownはプレーンテキストとして
// 処理されるため、執筆側がbaseプレフィックスなしで`/articles/...`と書くと、GitHub Pages
// (プロジェクトページ配信のためURLに`/poker-hand-media/`が乗る)本番では404になる。
// 2026-09、既存記事とのbaseプレフィックス有無の表記揺れが原因でこの404が実際に発生することを
// ローカルビルド+静的サーバーで確認したため導入した。
//
// 対象: `/`で始まり、かつ既にbaseが付与されていないhref(サイト内の絶対パスリンク)。
// 対象外: 外部URL(http/https/mailto等)、`//`始まりのプロトコル相対URL、
//         既にbaseプレフィックス付きのhref(冪等)、`#`始まりのページ内アンカー。
// これにより執筆側はbaseの有無を意識せず`/articles/...`と書くだけでよくなる
// (`docs/article-writing-guide.md`参照)。
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

export default function rehypeInternalLinks(base: string) {
	const trimmed = base.replace(/^\/+|\/+$/g, '');
	// baseが未設定(ルート配信)の場合は補完の必要がないため何もしない。
	if (!trimmed) return () => {};
	const normalizedBase = `/${trimmed}`;

	return (tree: Root) => {
		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'a') return;
			const href = node.properties?.href;
			if (typeof href !== 'string' || href.length === 0) return;
			if (!href.startsWith('/') || href.startsWith('//')) return;
			if (href === normalizedBase || href.startsWith(`${normalizedBase}/`)) return;

			node.properties.href = `${normalizedBase}${href}`;
		});
	};
}
