# Keep Sticky

Firebase Firestore をバックエンドとした PWA 付箋アプリ。
リアルタイム同期とオフライン対応により、複数端末で付箋を共有できます。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの準備

[Firebase Console](https://console.firebase.google.com/) で以下を設定してください。

1. **プロジェクト作成**: 「プロジェクトを追加」から新規作成
2. **Authentication 有効化**: Authentication → Sign-in method → **Google** を有効にする
3. **Firestore 作成**: Firestore Database → 「データベースを作成」→ テストモードで開始
4. **ウェブアプリ登録**: プロジェクトの設定 → マイアプリ → `</>` (ウェブ) → アプリ名を入力して登録

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、Firebase Console で取得した値を記入します。

```bash
cp .env.example .env
```

`.env` を編集:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> Firebase Console → プロジェクトの設定 → マイアプリ → 「SDK の設定と構成」に `firebaseConfig` オブジェクトとして表示されている値をそれぞれ対応する変数に記入してください。

### 4. 起動

```bash
npm run dev
```

`http://localhost:5173` でアプリが起動します。

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | TypeScript チェック + 本番ビルド |
| `npm run preview` | 本番ビルドのプレビュー（PWA動作確認用） |
| `npm run test:run` | テスト実行 |
| `npm run lint` | ESLint |

## 技術スタック

- React 19 + TypeScript + Vite 7
- Firebase (Authentication, Firestore)
- vite-plugin-pwa + Workbox
- Vitest
