# Google Analytics(GA4)導入手順(社長作業)

このドキュメントは、社長ご自身のGoogleアカウントでの操作が必要な手順をまとめたものです。**開発部では代行できません。**

## 前提

- サイト側の実装(`src/layouts/BaseLayout.astro`)は既に対応済みです。環境変数 `PUBLIC_GA_MEASUREMENT_ID` が設定されていればgtag.jsタグが自動的に出力され、未設定なら何も出力されません(架空のIDを埋め込まないための設計)。
- 測定IDは `G-` で始まる文字列です。

## 手順1: GA4プロパティの作成

1. [Google Analytics](https://analytics.google.com/) にログイン
2. 左下の「管理」(歯車アイコン)→「プロパティを作成」
3. プロパティ名(例: 「ポーカーハンドメディア」)、タイムゾーン(日本)、通貨(円)を設定して次へ
4. 業種・ビジネスの目的等を選択して「作成」
5. 利用規約に同意

## 手順2: データストリームの作成・測定ID取得

1. 作成したプロパティで「データストリーム」→「ウェブ」を選択
2. ウェブサイトのURL(`https://nattuuuzamiurai.github.io/poker-hand-media/`。独自ドメイン取得後はそちらに変更)とストリーム名を入力して「ストリームを作成」
3. 表示される「測定ID」(`G-XXXXXXXXXX`の形式)をコピー

## 手順3: 測定IDの設定

### ローカル開発環境(`npm run dev`で確認する場合)

1. リポジトリ直下に `.env` ファイルを作成(`.env.example` をコピー)
2. `PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`(実際のIDに置き換え)を設定
3. `.env` はGit管理外(`.gitignore`済み)なのでコミットされません

### GitHub Actions(本番デプロイ時のビルドに必要)

ローカルの`.env`はGitHub Actions上のビルドには反映されないため、リポジトリ側にも設定が必要です。

1. GitHubリポジトリ(`https://github.com/nattuuuzamiurai/poker-hand-media`)の「Settings」→「Secrets and variables」→「Actions」を開く
2. 「Variables」タブ(Secretsではなく変数でよい。測定IDは公開情報のため秘匿情報ではありません)→「New repository variable」
3. Name: `PUBLIC_GA_MEASUREMENT_ID`、Value: 実際の測定ID(`G-XXXXXXXXXX`)を入力して保存
4. 次回`main`ブランチへのpush時(または`.github/workflows/deploy.yml`を手動実行)から、GA4タグ付きでビルド・デプロイされます

## 確認方法

デプロイ後、公開サイトのページソースを表示し、`gtag(‘config', ‘G-…')` のスクリプトが出力されていることを確認してください。Google Analyticsの「レポート」→「リアルタイム」で、実際にサイトへのアクセスがカウントされるかも確認できます。
