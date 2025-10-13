# Keep Sticky - PWA付箋アプリ

<p align="center">
  <img src="./assets/logo.svg" alt="Keep Sticky Logo" width="128" height="128">
</p>

Google Keep風の機能を持つPWA（Progressive Web App）アプリケーションです。選択したメモをWindows付箋のような独立した小さな画面で表示できます。

## 🎯 プロジェクト概要

このプロジェクトは以下の機能を提供します：

1. **PWAアプリケーション** - オフライン対応、インストール可能
2. **TypeScript開発** - 型安全な開発環境
3. **Google Keep連携** - 安全なOAuth認証でGoogle Keepのメモを表示
4. **付箋表示機能** - 選択したメモを独立した小画面で表示
5. **Windows付箋風UI** - ドラッグ&ドロップ、サイズ調整対応

## 🛠️ 技術スタック

- **言語**: TypeScript
- **フロントエンド**: React + TypeScript
- **ビルドツール**: Vite  
- **PWA機能**: Service Worker, Web App Manifest
- **認証**: Google OAuth 2.0
- **スタイリング**: CSS Modules
- **状態管理**: React Context API
- **テスト**: Playwright (E2E), Jest (Unit)

## 📋 主要機能

### Google Keep連携
- 安全なGoogle OAuth 2.0認証
- メモ一覧の取得・表示
- リアルタイム同期

### 付箋表示
- 選択したメモを独立ウィンドウで表示
- ドラッグ&ドロップによる位置移動
- サイズ調整機能
- 複数付箋の同時表示
- 常に最前面表示

### PWA機能
- オフライン対応
- ホーム画面への追加
- レスポンシブデザイン
- プッシュ通知（オプション）

## 🚀 開発状況

現在、プロジェクトの基盤構築フェーズです。

### Phase 1: 基盤構築 (進行中)
- [x] プロジェクト初期化
- [x] Git リポジトリ設定
- [x] 基本パッケージ設定
- [x] Playwright セットアップ
- [ ] Vite + React + TypeScript セットアップ
- [ ] PWA設定

### 今後の予定
- Phase 2: Google Keep連携
- Phase 3: 付箋機能実装
- Phase 4: 最適化・仕上げ

詳細な設計については [AGENTS.md](./AGENTS.md) をご覧ください。

## 📁 プロジェクト構造

```
keep-sticky/
├── assets/                 # 画像・アセット
│   ├── logo.svg           # プロジェクトロゴ
│   └── favicon.svg        # ファビコン
├── AGENTS.md              # 詳細設計書
├── README.md              # プロジェクト概要
├── package.json           # NPM設定
└── (開発予定)
    ├── src/               # ソースコード
    ├── public/            # 静的ファイル
    └── dist/             # ビルド出力
```

## 🔧 開発開始準備

1. Google Cloud Console プロジェクト作成
2. Google Keep API 有効化・認証情報取得
3. Vite + React プロジェクトセットアップ
4. PWA設定追加

## 📄 ライセンス

ISC

---

**Keep Sticky** - Organize your thoughts, stick them anywhere! 📝✨