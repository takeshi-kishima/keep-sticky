# Keep Sticky - PWA付箋アプリ設計書

## プロジェクト概要

Firebase Firestore をバックエンドとしたPWA付箋アプリ。リアルタイム同期（`onSnapshot`）とオフライン対応（Firestore 内蔵 IndexedDB キャッシュ）により、複数端末で同期する付箋を提供する。

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: React 19 + Vite 7
- **バックエンド**: Firebase (Authentication, Firestore)
- **認証**: Firebase Auth (Google OAuth 2.0)
- **スタイリング**: CSS（CSS変数ベース）
- **状態管理**: React Context (認証) + Firestore リアルタイムリスナー
- **PWA**: vite-plugin-pwa + Workbox
- **テスト**: Vitest + React Testing Library

## ディレクトリ構成

```
src/
├── components/
│   ├── auth/               # 認証コンポーネント
│   │   ├── AuthProvider.tsx   # Firebase Auth プロバイダー (onAuthStateChanged)
│   │   ├── LoginButton.tsx    # Google ログインボタン
│   │   ├── useAuth.ts        # 認証コンテキストフック
│   │   └── index.ts
│   ├── notes/              # メモ関連コンポーネント
│   │   ├── NoteCard.tsx       # サイドバーのメモカード
│   │   ├── NoteEditor.tsx     # メモ作成/編集モーダル
│   │   └── NotesList.tsx      # メモ一覧（propsでデータ受け取り）
│   └── sticky/             # 付箋コンポーネント
│       └── StickyNoteComponent.tsx  # ドラッグ/リサイズ/インライン編集対応
├── contexts/
│   └── AuthContext.ts      # React Context 定義
├── hooks/
│   ├── useNotes.ts         # Firestore リアルタイムリスナー + メモ CRUD
│   └── useStickies.ts      # Firestore リアルタイムリスナー + 付箋操作
├── lib/
│   └── firebase.ts         # Firebase 初期化、auth/db/googleProvider エクスポート
├── services/
│   ├── NoteService.ts      # subscribeToNotes, createNote, updateNote, deleteNote
│   ├── StickyService.ts    # subscribeToStickies, createSticky, updateStickyPosition, etc.
│   ├── index.ts
│   └── __tests__/
│       └── StickyService.test.ts  # Firestore モック版テスト
├── types/
│   ├── Note.ts             # Note, CreateNoteRequest, UpdateNoteRequest
│   ├── StickyNote.ts       # StickyNote, Position, Size, UpdateStickyRequest
│   ├── User.ts             # User, AuthContextType
│   ├── index.ts
│   └── __tests__/
│       └── types.test.ts
├── App.tsx                 # ヘッダー + サイドバー + キャンバス + モーダル
├── App.css                 # 全レイアウト・コンポーネントスタイル
├── index.css               # リセット、CSS変数、ベーススタイル
├── main.tsx                # エントリポイント + SW登録
└── vite-env.d.ts           # PWA型定義
```

## Firestore DB構造

```
users/{uid}/
  notes/{noteId}      → { title, content, color, labels, isPinned, isArchived, createdAt, updatedAt }
  stickies/{stickyId}  → { noteId, position, size, isMinimized, zIndex }
```

- `zIndex` は `Date.now()` で管理（分散環境で安全）
- セキュリティルール: `firestore.rules`（ユーザーは自分のデータのみアクセス可能）

## アーキテクチャ設計方針

### サービス層: 関数ベース
Firestore が状態の源泉（source of truth）なので、サービス側に内部状態を持たない。クラスではなく純粋関数としてエクスポート。

### データフロー
```
Firestore → onSnapshot → カスタムフック (useNotes/useStickies) → React コンポーネント
                                  ↑
              ユーザー操作 → CRUD関数 → Firestore 書き込み
```

### 付箋のドラッグ最適化
ドラッグ中はローカル state で位置を管理し、`mouseup` 時にのみ Firestore に書き込む。これにより滑らかなドラッグ体験とFirestore書き込み回数の最小化を両立。

## UIレイアウト

```
┌─────────────────────────────────────┐
│  Header: ロゴ / +New / ユーザー情報  │
├──────────┬──────────────────────────┤
│ Sidebar  │  Sticky Canvas           │
│ メモ一覧  │  (ドラッグ可能な付箋)     │
│          │                          │
└──────────┴──────────────────────────┘
```

## 主要型定義

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  color: string;          // 付箋カラーパレット (#fff9c4, #f8bbd0, etc.)
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StickyNote {
  id: string;
  noteId: string;         // 対応するNote.id
  position: Position;     // { x, y }
  size: Size;             // { width, height } (最小: 200x150)
  isMinimized: boolean;
  zIndex: number;         // Date.now() ベース
}

interface User {
  id: string;             // Firebase UID
  email: string;
  name: string;
  picture: string;
}
```

## 環境変数

`.env` ファイルに Firebase 設定値を記入（`.gitignore` 済み）:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 開発コマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # TypeScript チェック + 本番ビルド
npm run preview       # ビルドプレビュー
npm run test:run      # テスト実行
npm run lint          # ESLint
```

## テスト

- **型定義テスト**: `src/types/__tests__/types.test.ts` (9テスト)
- **サービステスト**: `src/services/__tests__/StickyService.test.ts` (10テスト, Firestore モック)
- テストフレームワーク: Vitest + jsdom
