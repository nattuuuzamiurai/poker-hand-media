// Content Collections スキーマ定義
// 参考: https://docs.astro.build/en/guides/content-collections/
//
// 「articles」コレクション = 大型大会ハンド解説記事のデータソース。
// 企画部・コンテンツ制作部は `src/content/articles/*.md` に
// このスキーマに沿ったフロントマターでMarkdownファイルを追加するだけで
// 記事ページが自動生成される(テンプレート側の実装変更は不要)。
//
// 本文の構成(会社の企画書「記事の型(標準構成)」参照。
// cloude会社/projects/poker-media/README.md)は以下のように対応する:
//   1. 導入                      → 本文冒頭(見出しなしのリード文)
//   2. ハンド経過                → 本文 `## ハンド経過` などの見出し
//   3. プレイヤーの思考プロセス解説 → 本文中の見出し
//   4. 判断の評価                → 本文中の見出し
//   5. エクイティ目安            → 本文中の見出し
//   6. 学びのポイント            → 本文中の見出し
//   7. 出典明記                  → 本文中では書かない。下記 `sources` フィールドに
//                                   構造化して入力すると、記事下部に SourceList
//                                   コンポーネントが自動出力する(PrDisclosure /
//                                   AffiliateProductList と同じ「自動出力」パターン)。
// 詳細な執筆ルールは docs/article-writing-guide.md を参照。
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
	schema: z.object({
		// --- 基本情報 ---
		title: z.string(), // 記事タイトル
		targetKeyword: z.union([z.string(), z.array(z.string())]), // 対象キーワード(企画部のテーマ選定結果と対応)
		metaDescription: z.string().max(160), // メタディスクリプション(検索結果に表示。120〜160字目安)
		category: z.string().optional(), // 記事カテゴリ(例: "WSOP", "トリトンポーカー", "用語解説")

		// --- 日付 ---
		pubDate: z.coerce.date(), // 公開日
		updatedDate: z.coerce.date().optional(), // 更新日(あれば dateModified に反映)

		// --- 公開制御 ---
		// ai-jitsumu-navi と異なり既定値は true。
		// 大会ハンド解説は事実確認・著作権チェックの比重が大きい事業のため、
		// 品質管理部→レビュー部のGOが出るまでは非公開(draft: true)がデフォルトの安全側の運用とする。
		// 注意: draft: true でも `npm run dev`(ローカル開発サーバー)では表示される
		// (レイアウト確認のため。src/pages 側の getStaticPaths 参照)。
		// `npm run build`(本番/プレビューデプロイ用ビルド)では通常どおり除外される。
		draft: z.boolean().default(true),

		// --- 著者 / 編集方針 ---
		author: z.string().default('ポーカーハンドメディア編集部'),
		// 編集方針メモ(必須)。「配信・記事の解説を手がかりに、プレイヤーの思考プロセス・評価を
		// 独自の言葉で再構成した」旨や、著作権チェックリスト実施済みである旨を明記する。
		// (ai-jitsumu-navi の authorExperienceNote に相当。E-E-A-T対策と著作権配慮の両方を兼ねる)
		editorialNote: z.string(),

		// --- ハンド情報(このメディア特有のメタデータ) ---
		tournament: z.string().optional(), // 大会名・イベント名(例: "WSOP 2026 メインイベント")
		players: z.array(z.string()).default([]), // 登場プレイヤー名(タグ表示・将来の内部リンクハブに利用)

		// --- 出典(記事の型 7. 出典明記に対応。構造化データとして自動出力する) ---
		sources: z
			.array(
				z.object({
					label: z.string(), // 出典名(配信名・チャンネル名・記事名等)
					url: z.string().url(),
				}),
			)
			.default([]),

		// --- アフィリエイト商品情報(Amazonアソシエイト等の物販アフィリのみ想定) ---
		// オンラインカジノ/オンラインポーカー(実マネー)アフィリエイトは法的リスクが高いため非採用
		// (企画書「収益化・法務リスク」節参照)。
		affiliateProducts: z
			.array(
				z.object({
					name: z.string(), // 商品/サービス名
					url: z.string().url(), // アフィリエイトリンク(ASPの計測リンク)
					price: z.string().optional(), // 料金(記載可能な場合)
					description: z.string().optional(), // 一言紹介
					imageUrl: z.string().optional(), // 商品画像パス(任意)
				}),
			)
			.default([]),

		// --- 自社サービスへの送客(poker-tourney-log, fukuoka-poker-navi 等) ---
		relatedServices: z
			.array(
				z.object({
					name: z.string(),
					url: z.string().url(),
					description: z.string().optional(),
				}),
			)
			.default([]),
	}),
});

export const collections = { articles };
