# ポーカーハンドメディア (poker-hand-media)

WSOP・トリトンポーカーなど大型大会で盛り上がったハンドを厳選し、プレイヤーの思考プロセスと判断の評価を独自解説するメディア。cloude会社「poker-media」事業の実コード。

事業計画の詳細は会社側リポジトリを参照:
`cloude会社/projects/poker-media/README.md`

## 技術構成

- **フレームワーク**: Astro 7 (TypeScript, strict)
- **コンテンツ管理**: Astro Content Collections (`src/content.config.ts`)
- **ホスティング(予定)**: Cloudflare Pages。接続手順は [`docs/cloudflare-pages-setup.md`](./docs/cloudflare-pages-setup.md) を参照(未接続・未公開)

技術的な構成は、同じ会社の「ニッチアフィリエイトサイト群」パイロットサイト `ai-jitsumu-navi`(隣接ディレクトリ)を参考に構築している。Astro + Cloudflare Pages構成、Content Collections、コンポーネント設計(`PrDisclosure`/`AffiliateProductList`)などの基本パターンは共通。

## ディレクトリ構成

```
src/
├── content.config.ts          # Content Collectionsのスキーマ定義(このメディア特有: tournament/players/sources/relatedServices/tableContext/handProgression)
├── content/articles/*.md      # 記事本体(Markdown + フロントマター)
├── layouts/BaseLayout.astro   # 全ページ共通のSEO用metaタグ
├── lib/
│   ├── cards.ts                    # カード表記("A♠"等)の共通パースユーティリティ
│   └── rehype-card-badges.ts       # 本文中のカード表記を自動でバッジ化するrehypeプラグイン(astro.config.mjsに登録)
├── components/
│   ├── PrDisclosure.astro         # 景品表示法対応の「PR」表記
│   ├── AffiliateProductList.astro # アフィリエイト商品一覧(rel=sponsored付き)
│   ├── SourceList.astro           # 出典一覧(記事の型「7. 出典明記」を自動出力)
│   ├── RelatedServices.astro      # 自社サービス(poker-tourney-log/fukuoka-poker-navi)への送客
│   ├── CardBadge.astro            # カードバッジ(ランク+スートの色分け表示)。構造化データ側から明示的に使う部品
│   ├── HandProgression.astro      # ハンド進行表(ストリート別のボード/ポット/アクション)。`handProgression`を表示
│   └── TournamentInfoBar.astro    # トーナメント情報欄(参加人数・ブラインド・スタック・ポジション)。`tableContext`を表示
└── pages/
    ├── index.astro                # トップページ(記事一覧)
    └── articles/[...slug].astro   # 記事詳細ページ(動的生成テンプレート)
```

カードバッジ・ハンド進行表・トーナメント情報欄の使い方(サンプルコード込み)は [`docs/article-writing-guide.md`](./docs/article-writing-guide.md) の「5. ビジュアル部品」節を参照。サンプル記事 `wsop-2026-main-event-aces-vs-kings-vs-kings.md` で実際の表示レイアウトを確認できる。

## 記事の型(標準構成)とこのリポジトリでのマッピング

企画書(`cloude会社/projects/poker-media/README.md`)の「記事の型(標準構成)」7セクションを、以下のように実装している。

1. 導入 → 本文冒頭のリード文
2. ハンド経過 → 本文 `## ハンド経過` 見出し
3. プレイヤーの思考プロセスの解説 → 本文 `## プレイヤーの思考プロセス` 見出し
4. 判断の評価 → 本文 `## 判断の評価` 見出し
5. エクイティ目安 → 本文 `## エクイティ目安` 見出し(レンジ表現・表推奨)
6. 学びのポイント → 本文 `## 学びのポイント` 見出し
7. 出典明記 → 本文には書かず、フロントマターの `sources` フィールドに構造化入力(`SourceList`コンポーネントが自動出力)

詳細な執筆ルール・著作権チェックリストは [`docs/article-writing-guide.md`](./docs/article-writing-guide.md) を参照。

## 記事の追加方法

`src/content/articles/` に新しい `.md` ファイルを追加するだけで、`npm run build` 時に自動的にページが生成される。フロントマターのスキーマは `src/content.config.ts` を参照。

必須フィールド:

- `title` / `targetKeyword` / `metaDescription` / `pubDate`
- `editorialNote`: 編集方針メモ(必須)。情報源から独自にプレイヤーの思考プロセス・評価を再構成した旨を明記する
- `draft`: **デフォルト`true`**。品質管理部・レビュー部のGOが出るまで`true`のままにする(ai-jitsumu-naviとの相違点。詳細は下記「draftの扱い」参照)

任意フィールド: `tournament` / `players` / `sources` / `affiliateProducts` / `relatedServices` / `tableContext`(トーナメント情報欄) / `handProgression`(ハンド進行表)

## draftの扱い(ai-jitsumu-naviとの相違点)

このメディアは事実確認・著作権チェックの比重が大きい事業のため、`draft`のスキーマ既定値を`true`にしている(ai-jitsumu-naviは`false`)。

- `draft: true` の記事は **`npm run build`(本番/プレビューデプロイ用ビルド)からは除外される**
- ただし **`npm run dev`(ローカル開発サーバー)では表示される**(`src/pages/index.astro` と `src/pages/articles/[...slug].astro` の `getStaticPaths` に `|| import.meta.env.DEV` の分岐を追加している)。これはコンテンツ制作部・開発部がレイアウト・表示をローカルで確認できるようにするための意図的な設計で、本番ビルド・Cloudflare Pagesへのデプロイには影響しない

## 法令対応(景品表示法・ステルスマーケティング規制)

- 記事詳細ページの本文最上部に `PrDisclosure` コンポーネントで「【PR】本記事はアフィリエイト広告(プロモーション)を含みます」を必ず表示する
- アフィリエイトリンクには `rel="sponsored"` を付与し、商品カードにも個別に「広告」バッジを表示する(`AffiliateProductList.astro`)。自社サービスへの内部送客(`RelatedServices.astro`)は広告表示の対象外
- 品質管理部は公開前チェックでこの表示が欠落していないか確認すること

## 収益化方針

企画書の「収益化・法務リスク」節に準拠。AdSense・Amazonアソシエイト等の物販アフィリ・自社サービス(`poker-tourney-log`/`fukuoka-poker-navi`)への送客を採用。**オンラインカジノ・オンラインポーカー(実マネー)のアフィリエイトは日本国内での法的リスクが高いため非採用**(`content.config.ts`のコメント・`docs/article-writing-guide.md`にも明記)。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm install` | 依存関係インストール |
| `npm run dev` | 開発サーバー起動(`http://localhost:4321`) |
| `npm run check` | 型チェック(`astro check`) |
| `npm run build` | 本番ビルド(`./dist/` に出力) |
| `npm run preview` | ビルド結果のローカルプレビュー |

## CI

`.github/workflows/build-check.yml` により、PR作成時・main への push時に `npm run check` と `npm run build` が自動実行される想定(デプロイは行わない)。**現時点ではGitHubリポジトリ未作成のため未稼働**(下記「現状」参照)。

## 現状(2026-07-15時点)

- ローカルコードのみ。**GitHubリポジトリは未作成**(`git init`によるローカルリポジトリの初期化のみ実施)
- Cloudflare Pagesへの接続・プレビュー公開は未実施(手順は `docs/cloudflare-pages-setup.md` 参照。社長によるCloudflareログインが必要な作業のため開発部では実行不可)
- ドメイン未取得(`astro.config.mjs` の `site` はCloudflare Pages発行想定のプレースホルダードメイン `https://poker-hand-media.pages.dev`)
- ASP(A8.net等)未申込のため、記事内のアフィリエイトリンクは未設置。`poker-tourney-log`は未公開のためリンク先はプレースホルダー(`example.com`)
- Google Search Console確認タグ・Google AdSenseタグは未設定(架空のID埋め込みを避けるため。申請後に`src/layouts/BaseLayout.astro`のコメント箇所へ追記する)
- サンプル記事1本(`src/content/articles/wsop-2026-main-event-aces-vs-kings-vs-kings.md`)を投入済み。`draft: true`のプレースホルダーで、本文はレイアウト確認用の仮内容(事実確認前)。正式な記事執筆はコンテンツ制作部が別途行う
