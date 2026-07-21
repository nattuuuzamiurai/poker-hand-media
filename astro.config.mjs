// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeCardBadges from './src/lib/rehype-card-badges.ts';

// https://astro.build/config
// NOTE: `site`/`base` はCanonical URL・JSON-LD・アセットパス生成に使用する値。
// 2026-07-22、社長指示によりGitHub Pages(https://nattuuuzamiurai.github.io/poker-hand-media/)で
// 公開することになったため、GitHub Pagesのプロジェクトページ規約(ユーザーサイトではなくリポジトリ名がパスに乗る形式)
// に合わせて site/base を設定している。将来的に独自ドメイン取得・Cloudflare Pages接続に切り替える場合は
// site を実ドメインに、base を削除すること(docs/cloudflare-pages-setup.md参照、その場合は現在使っていない設定として残す)。
export default defineConfig({
	site: 'https://nattuuuzamiurai.github.io',
	base: '/poker-hand-media',
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
