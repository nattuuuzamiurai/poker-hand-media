# ポーカーハンドメディア (poker-hand-media)

WSOP・トリトンポーカーなど大型大会で盛り上がったハンドを厳選し、プレイヤーの思考プロセスと判断の評価を独自解説するメディア。「poker-media」事業の実コード。

事業計画の詳細は社内の非公開リポジトリの企画書を正とする。

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

企画書(社内非公開リポジトリ)の「記事の型(標準構成)」7セクションを、以下のように実装している。

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

## 品質管理部QAログ

### 2026-09-17: 第2サイクル新規4記事(記事2〜5)

対象: `docs/cycle2-planning.md`(第2サイクル企画書)に基づき執筆された以下4本。いずれも`draft: true`。

- `src/content/articles/triton-jeju-2026-tollerene-wins-main-event-river-bluff.md`(トレレーン優勝ハンド)
- `src/content/articles/triton-jeju-ii-2026-thorel-quad-threes-petrangelo.md`(ソレル vs ペトランジェロ)
- `src/content/articles/triton-jeju-ii-2026-invitational-bubble-bluff-wang-sun.md`(ワン vs サンのバブルブラフ)
- `src/content/articles/triton-jeju-ii-2026-mystery-bounty-ivey-four-way-allin.md`(アイビー四者オールイン)

**判定: 要修正**(致命的1件・要修正3件あり。下記の修正完了後に再チェックのうえレビュー部へ引き継ぐこと)

#### チェック結果

| # | 項目 | 判定 | 内容 |
|---|---|---|---|
| 1 | `npm run check` / `npm run build` | 合格 | 型チェック0エラー(警告は`z`非推奨等の既存の無害な警告のみ)。ビルド30ページ生成、対象4記事は`draft: true`のため正しくビルド対象から除外されることを確認 |
| 2 | フロントマター必須項目 | 合格 | 4記事とも`title/targetKeyword/metaDescription/category/featuredHands/pubDate/draft/author/editorialNote/tournament/players/tableContext/sources/affiliateProducts/relatedServices`が揃っており、サンプル記事(`triton-jeju-100k-main-event-foxen-folds-kings.md`)と同じ構造 |
| 3 | `draft: true` / `pubDate: 2026-09-17` | 合格 | 4記事とも該当。未来日付なし |
| 4 | `metaDescription`文字数(120字以上) | 合格 | 実測: トレレーン148字/ソレル130字/ワンvsサン134字/アイビー136字。すべて120字以上 |
| 5 | 事実確認(出典との照合) | **要修正** | 下記「致命的・要修正の指摘」参照。特にA〜Cが該当 |
| 6 | 著作権チェック | 合格 | 4記事ともPokerNews等の事実報道を要約したうえで、思考プロセス・判断の評価は独自の言葉で再構成されており、書き起こし転載は確認されなかった。引用も要点紹介にとどまる |
| 7 | 内部リンク | 一部要確認 | 下記「D」参照。リンク自体(記事2の2本)は実在ファイル・正しいslugだったが、フォーマットが既存記事と不整合。記事3・4・5は企画書が想定していた内部リンクが未実装(ブロッキングではないが要検討) |
| 8 | 社内情報の記載禁止遵守 | 合格 | 4記事本文・フロントマター・editorialNoteに部署名・社長・内部意思決定の詳細経緯の記載なし(grep確認済み) |
| 9 | 記事の型7セクション | 合格 | 4記事とも「導入→登場選手→(ハンド経過はhandProgressionで代替)→プレイヤーの思考プロセス→判断の評価→エクイティ目安→学びのポイント→出典(sourcesフィールド)」の構成を満たす。本文への`## ハンド経過`見出しの重複なし |
| 10 | `PrDisclosure` / `affiliateProducts: []` | 合格 | 4記事とも`affiliateProducts: []`(新規アフィリリンクなし)。テンプレート仕様上`PrDisclosure`は`affiliateProducts.length > 0`の時のみ表示されるため、非表示が正しい挙動 |
| 11 | `git status`(意図しない変更がないか) | 合格 | untrackedは対象4記事+`docs/cycle2-planning.md`のみ。既存ファイルへの変更なし |

#### 致命的・要修正の指摘

**A. 【致命的】記事2(トレレーン)本文末尾、クリステン・フォクセンとアレックス・フォクセンの人物取り違え**

該当箇所(本文末尾):
> 「なお、この大会で自己ベストの4位に入ったクリステン・フォクセンは、半年後のトリトンJeju IIのキャッシュゲームでも放送史上最大級のポットに絡んでいる。詳しくは[放送史上最大級1,100万ドルポットの一戦](/poker-hand-media/articles/triton-jeju-ii-foxen-ketola-11-million-pot/)で解説している。」

しかしリンク先の既存記事`triton-jeju-ii-foxen-ketola-11-million-pot.md`の`players`は`["アレックス・フォクセン", "オッシ・ケトラ(Monarch)"]`であり、主役は**アレックス・フォクセン(Alex Foxen)**であって、本記事の主役である**クリステン・フォクセン(Kristen Foxen)とは別人**(実際には夫婦関係にある別々のプロポーカープレイヤー)。この一文は実在する2人のプレイヤーを取り違えた明確な事実誤認であり、公開不可。
**修正案**: 「クリステン・フォクセンの夫であるアレックス・フォクセンは〜」等、正しい人物名に訂正するか、この一文自体を削除する。

**B. 【要修正】記事3(ソレル)登場選手セクション、WSOPパラダイス・スーパーメインイベント準優勝賞金の金額誤り**

該当箇所:
> 「2025年のWSOPパラダイス・スーパーメインイベントで準優勝(200万ドル、キャリアハイ)」

WebSearchで一次情報(WSOP公式ニュース"BERNHARD BINDER WINS 2025 WSOP PARADISE SUPER MAIN EVENT"等、複数ソース)を確認したところ、ソレル(Jean-Noel Thorel)の準優勝賞金は**$6,000,000**(600万ドル)であり、記事記載の「200万ドル」は誤り(3倍近い差)。「キャリアハイ」という位置づけ自体は正しいが、金額を600万ドルに訂正すること。

**C. 【要修正】記事3(ソレル)editorialNoteの出典説明が不正確(poker.org記事は別大会・別ハンドを扱った記事)**

editorialNoteは「ソレルの年齢(78歳)・経歴...はpoker.org「78-year-old Jean-Noel Thorel cracks aces, eyes first Triton title」を出典としています(...本ハンドと同時期・同大会を扱う記事で明記された数値を優先し、78歳を採用しました)」と説明しているが、WebFetchで当該poker.org記事の全文を確認したところ、この記事はJeju II($100,000メインイベント、ソレル vs ペトランジェロ)ではなく、**別のTriton大会($25,000 NLH「Jupiter」イベント)における、トニー・レン・リン(Tony 'Ren' Lin)との別のハンド**(3♠3♦ vs A♥A♦)を扱った記事だった。
「78歳」という年齢自体は他ソース(NAOSの公式サイト、Jason Koon氏のポスト等)でも独立に確認でき、事実として問題はないが、editorialNoteの「本ハンドと同時期・同大会を扱う記事」という説明は誤りなので、「別のTriton大会(Jupiter $25,000イベント)を報じた記事だが、選手の年齢・経歴について言及しているため出典とした」等、正確な記述に訂正すること。

**D. 【軽微・要検討】記事2の内部リンクのパス形式が既存記事と不整合(ただし新規記事側が技術的には正しい)**

記事2は本文中のリンクを`/poker-hand-media/articles/...`（`astro.config.mjs`の`base: '/poker-hand-media'`を含む形）で記述している。一方、`npm run build`後の`dist/`を確認したところ、**既存の29記事の本文中リンクはすべて`/articles/...`（baseプレフィックスなし)で出力されており、本番相当のGitHub Pages配信(`https://nattuuuzamiurai.github.io/poker-hand-media/`)ではこれらのリンクはすべて404になる**(Astroの`base`設定はコンポーネント側の`withBase()`経由のリンク—トップページのカード等—にのみ適用され、本文Markdown中の生のhrefには適用されない仕組みのため)。
今回の記事2のリンクはbaseプレフィックスを含めておりこちらが正しい形式だが、サイト全体では表記が割れている状態になる。**これは今回の4記事のスコープ外の既存の重大な既知バグ(29記事すべての本文内部リンクが本番で機能しない)なので、品質管理部から開発部への別件エスカレーションとして扱うことを推奨**(本バッチの合否判定のブロッカーとはしない)。

#### その他の指摘(ブロッキングではないが記録)

- 記事2のeditorialNoteは、フロップ・ターンのベット額について「具体額は出典に記載なし」としているが、引用元の一つCardplayer記事には実際にはフロップのチェックコール500,000・ターンのベット2,000,000という具体額の記載がある(WebFetchで確認)。金額を反映するか、「記載なし」という説明を修正することを推奨(数値そのものが誤っているわけではなく、出典確認の徹底度の問題)
- 企画書(`docs/cycle2-planning.md`)の内部リンク設計節は、記事3(用語解説記事への導線)・記事4(WSOP Event #39バブルブラフ記事)・記事5(用語解説記事・`poker-tourney-log`)への前方リンク追加を推奨していたが、実装されていない。必須ではないが、内部リンク・回遊率の観点で追加を検討してもよい
- Ben Tollereneの生涯獲得賞金(記事2「3,631万ドル超」)はWebSearchで直接一致する数値を確認できなかった(検索でヒットした$32,417,102はこのJeju優勝分$3,766,000を反映する前の値である可能性があり、合算するとほぼ一致するため大きな矛盾ではないと判断したが、断定はできない)。Hendon Mob本体は403で直接確認不可だったため、確度は「未検証」として記録
- 記事4の「セミ・サン」は選手プロフィール情報が確認できなかった旨を素直に明記しており(憶測なし)、方針として適切

#### 検証方法の記録(後工程の二度手間防止のため)

- `npm run check` / `npm run build`をリポジトリルートで実行し出力を確認
- 4記事の`sources`に列挙されたURLのうちPokerNews記事4本・poker.org記事1本をWebFetchで直接開き、ホールカード・ボード・ベット額・結果を本文と突き合わせ
- Hendon Mobの選手ページ2件はWebFetchが403 Forbiddenで取得不可(アクセス制限。content-writer側も同種の制限に言及しており整合)
- 選手の経歴・受賞歴の一部(Ben Tollerene・Yang Wang・Jean-Noel Thorelの賞金額)はWebSearchで補足確認
- `grep`で社内情報の記載禁止対象語(部署名等)・内部リンクパターンを4記事に対して横断検索
- `git status`で意図しない変更がないことを確認

### 2026-09-17: 上記A/B/Cの再QA(修正版の検証)

対象: A(記事2の人物取り違え)・B(記事3の準優勝賞金)・C(記事3のeditorialNote出典説明)の3件について、コンテンツ制作部による修正後の再検証。

**判定: 要修正(継続)**——A/B/Cの当初指摘そのものは3件とも正しく修正されたことを確認したが、再検証の過程で**新たにE(要修正1件)**を検出した。加えて**F(軽微1件、要検討)**も記録する。E以外はブロッカーではないため、Eの修正を確認できればレビュー部へ引き継ぎ可能という判定。

#### A/B/Cの修正確認結果

| # | 項目 | 判定 | 内容 |
|---|---|---|---|
| A | 記事2本文末尾、フォクセン人物取り違えの訂正 | **合格** | 「クリステン・フォクセンの夫でもあるアレックス・フォクセンは、〜ポットに絡んでいる」に修正され、4位入賞をクリステン、$11Mポットの当事者をアレックスに正しく紐づける文構造になっている。WebSearchで裏取りした結果、Kristen Foxen(旧姓Bicknell)とAlex Foxenは2022年4月に結婚した夫婦であることを複数ソース([PokerListings](https://www.pokerlistings.com/blog/three-famous-poker-couples-brought-together-by-the-game)等)で確認。人物取り違えは解消され、夫婦関係の事実も正確 |
| B | 記事3、WSOPパラダイス・スーパーメインイベント準優勝賞金 | **合格** | 「200万ドル」→「$6,000,000」に訂正済み。[WSOP公式](https://www.wsop.com/news/bernhard-binder-wins-2025-wsop-paradise-super-main-event/)・[PokerNews](https://www.pokernews.com/news/2025/12/bernhard-binder-wins-wsop-paradise-super-main-event-50265.htm)・[PokerListings](https://www.pokerlistings.com/news/bernhard-binder-defeated-jean-noel-thorel-heads-up-in-the-25k-super-main-event-wsop-paradise-10m)等複数の一次・準一次情報で$6,000,000(Binder優勝$10,000,000に対する準優勝)を確認。金額は正しい |
| C | 記事3editorialNoteのpoker.org出典説明 | **合格** | 「本ハンドを扱ったものではなく、同じトリトン済州IIで行われた別の大会($25,000 Jupiterイベント、トニー・レン・リンとの別ハンド)を報じた記事であるため、年齢という人物情報のみを補助的に採用」に訂正済み。[poker.org記事](https://www.poker.org/latest-news/78-year-old-jean-noel-thorel-cracks-aces-eyes-first-triton-title-aHNdY8g3BWsC)をWebFetchで再確認したところ、実際に対象は「$25K NLH Jupiter Event」でのソレル(3♠3♦)対トニー・レン・リン(A♥A♦)のハンドであり、記事の新しい説明文と完全に一致する |

#### 新たに検出した指摘

**E. 【要修正】記事3editorialNote、$6,000,000の出典として挙げているpokerscout.com記事に、その数値の記載がない**

該当箇所:
> 「実業家としての経歴(NAOS/Biodermaの創業者であること等)、およびWSOPパラダイス・スーパーメインイベントでの準優勝賞金($6,000,000)は、Wikidata・pokerscout.com「Bernhard Binder Triumphs Over Jean-Noel Thorel to Win the WSOP Paradise Super Main Event for $10 Million」を出典としています。」

WebFetchで当該pokerscout.com記事の全文を確認したところ、優勝者Binderの$10,000,000には言及があるが、**ソレルの準優勝賞金額($6,000,000)についての記載は記事中に一切存在しない**(「runner-up」という肩書きの言及はあるが金額の記載なし)。Wikidataのページ(https://www.wikidata.org/wiki/Q53580099)も職業・経歴情報が中心で、本大会の準優勝賞金額を裏付ける記述は確認できなかった。
$6,000,000という数値そのものはWSOP公式・PokerNews・PokerListings等の複数の独立ソースで裏付けが取れており事実として正しい(B参照)。しかし、editorialNoteが実際にその数値を出典として明示している2本(Wikidata・pokerscout.com)は、その数値を裏付ける記述を含んでいない「出典と主張の不一致」があり、後から検証する読者・後工程が出典をたどっても数値を確認できない状態になっている。
**修正案**: editorialNoteの出典表記を、実際に$6,000,000の記載があるソース(例: [WSOP公式ニュース](https://www.wsop.com/news/bernhard-binder-wins-2025-wsop-paradise-super-main-event/)や[PokerNews](https://www.pokernews.com/news/2025/12/bernhard-binder-wins-wsop-paradise-super-main-event-50265.htm))に差し替えるか、追加で明記すること。実業家としての経歴(NAOS/Bioderma創業)についてはpokerscout.com記事内に該当する記述が実際にあるため、こちらの出典表記はそのままで問題ない。

**F. 【軽微・要検討】記事3本文、2024年トリトン済州メインイベント準優勝賞金の概算表記とeditorialNoteでの出典未記載**

該当箇所(本文「登場選手」セクション):
> 「2024年のトリトン済州メインイベントでも準優勝(280万ドル)と、大型大会での勝負強さで知られる。」

WebSearchで確認したところ、この2024年大会(優勝Roman Hrabec $4,330,000)でのソレルの準優勝賞金は**$2,875,000**であり、本文の「280万ドル」は実際の値をやや下回る概算(約2.6%の差、$75,000相当)。金額のオーダー・「準優勝」という事実自体は正しく、致命的な誤りとは言えないが、正確には「約288万ドル」または「$2,875,000」とすべきところを丸めている。加えて、この事実・数値はeditorialNoteのどの出典にも紐づけられておらず(sourcesリストにも該当する出典URLが見当たらない)、他の数値がすべて出典明記を徹底している本記事の中でこの一文だけ出典が追跡できない状態になっている。
**修正案**: 正確な数値($2,875,000、または「約288万ドル」)に修正し、根拠となる出典(例: [livepoker.fr](https://www.livepoker.fr/actualites3-4_Jean-noel-thorel-termine-2e-du-main-event-des-triton-series-jeju.html)等)をeditorialNoteのsourcesに追加することを推奨。ブロッキングではないが、次回サイクルで数値を扱う際は同様の丸め・出典欠落がないか特に注意すること。

#### 再チェック項目ごとの結果まとめ

| # | 項目 | 判定 | 内容 |
|---|---|---|---|
| 1 | A/B/Cが実際に正しく修正されているか | 合格 | 上表参照。3件とも指摘通りに修正され、出典裏取りでも事実関係は正しいことを確認 |
| 2 | 修正時に新たな誤りが混入していないか | **要修正** | E(editorialNoteの出典と数値の不一致)を新規検出。F(軽微)も記録 |
| 3 | 対象2ファイル以外に意図しない変更がないか | 合格 | `git status`は前回と同じ4記事(untracked)+`docs/cycle2-planning.md`(untracked)+`README.md`(modified)のみ。記事4・5・企画書はファイルのmtimeが今回の修正時刻(記事2: 10:35台、記事3: 10:36台)より前(記事4: 10:20台、記事5: 10:19台、企画書: 9:47台)であり、今回のA/B/C修正作業では触れられていないことを確認 |
| 4 | `npm run check && npm run build` | 合格 | `npm run check`は0エラー・0警告(既存の`z`非推奨等のhintのみ)。`npm run build`は前回同様30ページ生成、エラーなし |
| 5 | 前回「軽微」記録済み項目(記事2 flop/turnベット額、内部リンク未実装、Dの内部リンクパス形式) | 対象外(今回スコープ外につき未確認・現状維持) | 指示通り再確認していない |

#### 検証方法の記録(追加分)

- Kristen Foxen / Alex Foxenの夫婦関係: WebSearchで[PokerListings](https://www.pokerlistings.com/blog/three-famous-poker-couples-brought-together-by-the-game)等の複数ソースを確認(2022年4月結婚)
- WSOPパラダイス・スーパーメインイベントのThorel準優勝賞金: WebSearchで[WSOP公式](https://www.wsop.com/news/bernhard-binder-wins-2025-wsop-paradise-super-main-event/)含む複数ソースを確認($6,000,000で一致)
- poker.org記事本文: WebFetchで直接取得し、対象大会・対戦相手・ホールカードを確認($25K Jupiterイベント、Tony 'Ren' Lin、3♠3♦ vs A♥A♦)
- editorialNoteが引用するpokerscout.com記事本文・Wikidataページ: WebFetchで直接取得し、$6,000,000の記載有無を確認(記載なし → E)
- 2024年トリトン済州メインイベントのThorel準優勝賞金: WebSearchで確認($2,875,000 → F)
- PokerNews記事(記事3の主要ソース)を再度WebFetchし、ホールカード・ボード・ベット額・ブラインドレベルが本文と一致することを再確認
- ファイルの`mtime`(更新日時)を確認し、記事4・5・企画書が今回の修正作業時間帯に触れられていないことを確認
- `npm run check` / `npm run build`を再実行
- `git status --porcelain` / `git diff --stat`で変更範囲を再確認

#### 最終結論

**要修正(1件: E)。ただしA/B/Cは合格し、Eは軽微〜中程度の「出典と数値の不一致」であり事実誤認そのものではないため、対応は迅速に完了できる見込み。**

- E(editorialNoteの$6,000,000の出典差し替え)の修正が完了し、その修正箇所を再確認できた時点で**レビュー部へ引き継ぎ可能**と判断する
- Fは軽微・要検討のため、Eの修正時にあわせて直すことを推奨するが、単独では公開のブロッカーとしない
- 今回のスコープ外(記事2 flop/turnベット額の扱い、記事3〜5の内部リンク未実装、記事2内部リンクのbaseプレフィックス問題)は引き続き別トラック(開発部エスカレーション等)で扱うこと


### 2026-09-17: E/Fの修正確認(最終QA)

対象: `src/content/articles/triton-jeju-ii-2026-thorel-quad-threes-petrangelo.md`のみ。E(editorialNoteの$6,000,000出典差し替え)・F(2024年準優勝賞金の数値訂正)の修正報告を検証。

**判定: 合格。第2サイクル新規4記事(記事2〜5)は全項目クリアし、レビュー部へ引き継ぎ可能。**

#### 確認結果

| # | 項目 | 判定 | 内容 |
|---|---|---|---|
| E | editorialNoteの出典差し替え(Wikidata・pokerscout.com → WSOP公式) | 合格 | [WSOP公式記事](https://www.wsop.com/news/bernhard-binder-wins-2025-wsop-paradise-super-main-event/)をWebFetchで再確認し、最終結果表に「2nd place: Jean-Noel Thorel - $6,000,000」の記載を直接確認。editorialNoteの説明・sources配列とも整合。NAOS/Bioderma創業の経歴部分は引き続きWikidataを出典としており、こちらは元々整合していたため据え置きで問題なし |
| F | 2024年トリトン済州メインイベント準優勝賞金を$2,875,000に訂正、lamateurdepoker.fr出典追加 | 合格 | [lamateurdepoker.fr記事](https://lamateurdepoker.fr/2024/03/18/triton-series-jeju-jean-noel-thorel-runner-up-pour-un-gain-xxl/)をWebFetchで確認し、「gagnant ainsi 2.875.000 $」の記載および優勝者Roman Hrabec($4,330,000)の記載を確認。本文の数値・sources追加内容と一致 |
| 3 | 影響範囲(このファイルのみの変更か) | 合格 | `git status`で本ファイルのみ更新(他の3記事・`docs/cycle2-planning.md`はmtime変化なし、既存tracked ファイルへの変更もなし)を確認 |
| 4 | `npm run check && npm run build` | 合格 | 0エラー・0警告(既存hintのみ)。ビルド30ページ生成、エラーなし |

#### 最終結論

**合格。今回の第2サイクル新規4記事(記事2〜5)は、致命的指摘A・要修正指摘B/C/E/Fすべて解消を確認した。レビュー部へ引き継ぎ可能。**

- 未解決のまま持ち越す項目(公開のブロッカーではなく別トラックで扱う):
  - D: 記事2の内部リンクパス形式(baseプレフィックス)問題 — サイト全体(既存29記事含む)の既知バグとして開発部への別件エスカレーション対象
  - 記事2 flop/turnベット額の「具体額は出典に記載なし」表記とCardplayer記事の実際の記載(500,000/2,000,000)との齟齬
  - 記事3〜5の内部リンク未実装(企画書が想定していた前方リンク)
  - Ben Tollereneの生涯獲得賞金の「未検証」フラグ
- 上記持ち越し項目はレビュー部への引き継ぎ資料にその旨を明記し、ブロッカーではないことを申し送りする

### 2026-09-17: レビュー部 最終判定(第2サイクル新規4記事)

対象は品質管理部が最終合格させた以下4本(いずれも `draft: true`)。

- `src/content/articles/triton-jeju-2026-tollerene-wins-main-event-river-bluff.md`(記事2・トレレーン)
- `src/content/articles/triton-jeju-ii-2026-thorel-quad-threes-petrangelo.md`(記事3・ソレル)
- `src/content/articles/triton-jeju-ii-2026-invitational-bubble-bluff-wang-sun.md`(記事4・ワン vs サン)
- `src/content/articles/triton-jeju-ii-2026-mystery-bounty-ivey-four-way-allin.md`(記事5・アイビー)

**判定: 記事3・4・5は GO。記事2は NO-GO(1件、修正は軽微・即時対応可能)。**

#### 確認の進め方

品質管理部の3ラウンドのQAログ(致命的1件A・要修正B/C→再QAで新規検出E・軽微F→最終ラウンドでA/B/C/E/F全て解消)を確認し、事実確認・カードの数学的整合性・著作権チェックはQAの検証結果を信頼した。レビュー部としては「出して良いか」の観点(ブランドトーン・戦略整合性・法令/炎上リスク・内部情報の漏洩・編集履歴の露出)に絞って4記事本文を通し読みした。

#### 確認結果

1. **QA指摘の解消確認**: A(記事2、クリステン/アレックス・フォクセンの人物取り違え)、B(記事3、WSOPパラダイス準優勝賞金)、C(記事3、poker.org出典説明)、E(記事3、$6,000,000の出典差し替え)、F(記事3、2024年準優勝賞金の数値・出典追加)のいずれも、現在の本文・editorialNoteで正しく反映されていることを確認した。修正前後の経緯(「以前は〜だったが訂正した」等)を匂わせる記述は本文・editorialNoteのどこにも残っておらず、初読の読者が違和感を持つ書きぶりにはなっていない(編集履歴の露出チェック: 問題なし)。
2. **ブランドトーン**: 4記事とも「プレイヤーの思考プロセス」「判断の評価」を独自の言葉で構成しており、配信・記事の要約止まりや書き起こし転載になっていない。情報源が薄い記事2・3では、企画書の指示通り「情報源にない深さを作文で埋めない」姿勢がeditorialNoteで明示されており、誠実な設計になっている。
3. **法令・炎上リスク**: 4記事とも`affiliateProducts: []`のため`PrDisclosure`非表示は仕様通り正しい挙動で、景表法・ステマ規制上の問題はない。`rel="sponsored"`が必要なアフィリエイトリンクも今回は存在しない。実マネーのオンラインポーカー/カジノアフィリエイトは一切含まれておらず、事業計画(収益化・法務リスク節)と整合している。誇大表現・断定的な必勝法的な表現も見当たらない。
4. **内部情報の漏洩チェック(独立確認)**: 部署名・「社長」・内部の意思決定の詳細な経緯は4記事とも記載なし(grep確認、QA項目8の結果と一致)。**ただし記事2(トレレーン)のeditorialNoteに次の一文があり、これはQAのチェック対象外だった技術的表記の漏洩として新たに検出した。**
   > 「執筆時に追加でWebSearch・WebFetchによる裏取りを行い、一部の関連記事の要約情報に...」
   `editorialNote`は`src/pages/articles/[...slug].astro`で本文下部に「編集方針について」として**読者に公開表示される**フィールドであり、ここに実際にコンテンツ制作部(AIエージェント)が使用しているツール名(WebSearch/WebFetch)がそのまま露出している。他の3記事には同種の表記は無い(grep確認済み)。部署名や社長といった社内情報そのものではないが、記事が人間の編集部ではなくAIエージェントによって特定のツール呼び出しで機械的に作られていることを示唆する技術的表記であり、CLAUDE.mdの「内部情報の漏洩チェック」方針(内部の技術的表記を読者向け本文に混入させない)の趣旨に抵触する。修正は文言の言い換えのみで足りる(例:「執筆時に追加で情報源の裏取り調査を行い」等、ツール名を出さない表現に置き換える)。
5. **持ち越し事項(QAからの申し送り)のブロッカー判定**:
   - D(記事2内部リンクのbaseプレフィックス問題): 記事2自身の新規リンク2本は`base`込みの正しい形式で実装されており、記事2単体の公開には支障がない。問題は既存29記事側のリンクが本番で404になるという既知バグであり、本バッチのスコープ外。**ブロッカーとしない**が、放置すると公開済み29記事の内部リンクが機能しない状態が続くため、開発部への別件エスカレーションを改めて推奨する(品質管理部の申し送り通り)。
   - 記事2のflop/turnベット額「具体額は出典に記載なし」表記とCardplayer記事の実際の記載(500,000/2,000,000)との齟齬: 事実誤認ではなく出典確認の徹底度の問題。読者に実害のある誤りではないため**ブロッカーとしない**。
   - 記事3〜5の内部リンク未実装: SEO・回遊率上望ましいが、無いこと自体は誤情報でも法令違反でもないため**ブロッカーとしない**(公開後の追記で対応可)。
   - Tollereneの生涯獲得賞金「未検証」フラグ(記事2、3,631万ドル超): 「Hendon Mob調べ」と出典を明記した上での紹介文であり、記事の主題(ハンドの経過・判断の評価)には影響しない付随情報のため**ブロッカーとしない**。

#### 最終結論

- **記事3(ソレル)・記事4(ワン vs サン)・記事5(アイビー): GO。** 公開のブロッカーとなる指摘なし。上記「持ち越し事項」はいずれも公開後で対応可能な軽微事項。
- **記事2(トレレーン): NO-GO(暫定・軽微)。** 唯一の修正条件は、editorialNote内の「WebSearch・WebFetchによる裏取りを行い」という一文をツール名を含まない一般的な表現に言い換えること(事実関係・数値・引用出典には変更不要)。**対応部署: コンテンツ制作部**(該当一文の言い換えのみ)。修正後は事実関係に影響しない純粋な文言修正のため、品質管理部への差し戻し往復は必須とせず、修正箇所を`grep -riE "WebSearch|WebFetch|Claude|エージェント" src/content/articles/triton-jeju-2026-tollerene-wins-main-event-river-bluff.md`等で確認できればレビュー部として即GOに切り替えてよい。
- 修正・確認が取れ次第、対象記事の`draft`を`false`に変更し本番ビルド対象に含める作業(開発部 or 経営管理オフィス)に進んでよい(2026-07-15付の自動運転承認範囲内、社長確認不要)。
- 別トラック事項として、既存29記事の内部リンクが本番で404になる既知バグ(D)の開発部エスカレーションは引き続き未着手であれば早めの対応を推奨する。

#### 2026-09-17: 記事2の修正確認・GOへ切り替え(経営管理オフィス)

editorialNote内の該当一文を「執筆時に追加でWebSearch・WebFetchによる裏取りを行い」→「執筆時に追加で情報源の裏取り調査を行い」に修正(事実関係・数値・出典URLは無変更)。レビュー部指定のコマンド `grep -riE "WebSearch|WebFetch|Claude|エージェント" src/content/articles/triton-jeju-2026-tollerene-wins-main-event-river-bluff.md` および他3記事への同種混入の有無を再確認し、いずれも該当なし(exit 1)。`npm run check`も0 errors/0 warningsを維持。

**→ 記事2も GO に切り替え。第2サイクル新規4記事(記事2〜5)すべて公開可。**
