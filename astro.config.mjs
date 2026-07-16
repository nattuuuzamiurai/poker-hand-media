// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeCardBadges from './src/lib/rehype-card-badges.ts';

// https://astro.build/config
// NOTE: `site` はCanonical URL/JSON-LD生成に使用する値。
// 独自ドメイン未取得のため、暫定的にCloudflare Pages発行想定のプレースホルダードメインを設定している。
// Cloudflare Pagesへの接続(docs/cloudflare-pages-setup.md参照)・独自ドメイン取得後、実際の値に書き換えること。
export default defineConfig({
	site: 'https://poker-hand-media.pages.dev',
	// sitemap: 実際にビルドされたページ(＝ getStaticPaths で draft: true を除外済みの記事)
	// のみが自動的に対象になる。ビルド後の routes 一覧から生成されるため、
	// 記事側の公開制御ロジック([...slug].astro の getStaticPaths フィルタ)と重複して
	// 管理する必要はない。
	integrations: [sitemap()],
	// 記事本文(Markdown)中の「A♠」のようなカード表記を自動的にカードバッジへ変換する。
	// Astro 7ではデフォルトのMarkdownプロセッサがremark/rehype(unified)ベースではなくなったため、
	// カスタムrehypeプラグインを使うには `@astrojs/markdown-remark` の `unified()` プロセッサを明示的に指定する
	// (`markdown.rehypePlugins` 直指定は非推奨。詳細: astro側の警告メッセージ、および
	// https://docs.astro.build/en/guides/markdown-content/#markdown-plugins)。
	// 詳細: src/lib/rehype-card-badges.ts / docs/article-writing-guide.md
	markdown: {
		processor: unified({ rehypePlugins: [rehypeCardBadges] }),
	},
});
