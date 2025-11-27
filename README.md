# Recode App

TypeScript と Vite を使用した音声再生アプリケーション。GitHub Pages にデプロイ可能な静的Webアプリです。

## 機能

- 音声ファイル（m4a形式）の再生
- JSONファイルによる音声ファイル一覧の管理
- レスポンシブデザイン対応

## プロジェクト構成

```
recode_app/
├── public/
│   ├── audio/          # 音声ファイル（.m4a）を配置
│   └── vite.svg
├── src/
│   ├── main.ts         # メインのTypeScriptファイル
│   ├── style.css       # スタイルシート
│   ├── audioList.json  # 音声ファイル一覧
│   └── vite-env.d.ts   # 型定義ファイル
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 音声ファイルの配置

`public/audio/` ディレクトリに音声ファイル（.m4a形式）を配置してください。

### 3. 音声ファイル一覧の更新

`src/audioList.json` を編集して、音声ファイルの情報を追加します。

```json
[
  {
    "id": "1",
    "title": "音声タイトル",
    "filename": "audio-file.m4a"
  }
]
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスして動作を確認できます。

### 5. ビルド

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## GitHub Pages へのデプロイ

### 1. GitHub リポジトリの作成

GitHubで新しいリポジトリを作成し、コードをプッシュします。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/recode_app.git
git push -u origin main
```

### 2. GitHub Actions ワークフローの作成

`.github/workflows/deploy.yml` ファイルを作成します。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. GitHub Pages の設定

1. GitHubリポジトリの Settings → Pages に移動
2. Source で「GitHub Actions」を選択
3. コードをプッシュすると自動的にデプロイされます

### 4. base パスの設定

`vite.config.ts` の `base` オプションをリポジトリ名に合わせて変更してください。

```typescript
export default defineConfig({
  base: '/recode_app/',  // リポジトリ名に合わせて変更
})
```

## 技術スタック

- **TypeScript**: 型安全なJavaScript
- **Vite**: 高速なビルドツール
- **HTML5 Audio**: 音声再生機能

## ライセンス

MIT

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果をプレビュー |
