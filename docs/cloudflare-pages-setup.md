# Cloudflare Pages 接続手順(社長作業・未実施)

このドキュメントは、開発部ではログインできないCloudflareアカウント操作が必要なため、
実行手順のみをまとめたものです。**社長ご自身での実施をお願いします。**
開発部・経営管理オフィスによる代行実行は行っていません。

## 前提

- GitHubリポジトリ: **未作成**(このプロジェクトはまだGitHubにpushしていない。`git init`によるローカルリポジトリの初期化のみ済み)
- Astroプロジェクトはローカルで `npm run build` 済み、`dist/` が正常に生成されることを確認済み
- 独自ドメインは未取得(現段階のスコープ外。`astro.config.mjs`の`site`はCloudflare Pages発行想定のプレースホルダードメイン)

## 手順

0. (未実施・要判断)GitHubにプライベートリポジトリを作成し、このプロジェクトをpushする(会社の標準ワークフローに沿ってPRベースの開発をする場合はここから)
1. https://dash.cloudflare.com/ にログイン(Cloudflareアカウントがなければ新規作成。無料プランで可)
2. 左メニューから **Workers & Pages** を選択
3. **Create application** → **Pages** タブ → **Connect to Git** を選択
4. GitHubアカウント連携を求められたら認可し、`poker-hand-media` リポジトリを選択
5. ビルド設定を以下の通り入力する

   | 項目 | 値 |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (リポジトリ直下) |

6. 環境変数は現時点で不要(ASP契約後にアフィリエイトID等を追加する場合は Settings → Environment variables から設定し、コードに直書きしない)
7. **Save and Deploy** を実行すると、初回ビルド・デプロイが自動的に走る
8. デプロイ完了後、`*.pages.dev` のプレビューURLが発行される。**これが実際の初回公開行為に相当するため、実行タイミングは社長のご判断にお任せする**(現段階では実行しないでください。本ドキュメントは手順の提示のみ)
9. 独自ドメインを取得した場合は、Pagesプロジェクトの **Custom domains** から追加し、`astro.config.mjs` の `site` の値を実ドメインに書き換えるPRを開発部が作成する

## 以降の運用

- 一度接続すれば、`main` ブランチへのマージ(=経営管理オフィスによるレビュー部GO後のマージ)のたびにCloudflare Pagesが自動で再ビルド・再デプロイする
- プレビューデプロイ(PRごとの検証用URL)も自動発行されるため、レビュー部はマージ前にプレビューURLで見た目を確認できる
- 記事は`draft: true`である限り本番ビルド(`npm run build`)から自動的に除外されるため、Cloudflare Pages接続後もdraft記事が誤って一般公開されることはない
