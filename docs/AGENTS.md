# Keep Sticky - PWA付箋アプリ詳細設計

## プロジェクト概要

Google Keep風の機能を持つPWA（Progressive Web App）アプリケーションを開発し、選択したメモをWindows付箋のような独立した小さな画面で表示できる付箋アプリを作成する。

## 技術仕様

### 基本技術スタック
- **言語**: TypeScript
- **アプリケーション形式**: PWA (Progressive Web App)
- **認証**: Google OAuth 2.0 (Google Keep API連携用)
- **フロントエンド**: React + TypeScript
- **スタイリング**: CSS Modules または Styled Components
- **状態管理**: React Context API または Redux Toolkit
- **ビルドツール**: Vite
- **PWA機能**: Service Worker, Web App Manifest

### アーキテクチャ構成

```
src/
├── components/           # UIコンポーネント
│   ├── auth/            # 認証関連コンポーネント
│   ├── notes/           # メモ関連コンポーネント
│   ├── sticky/          # 付箋表示コンポーネント
│   └── common/          # 共通コンポーネント
├── hooks/               # カスタムフック
├── services/            # API呼び出し、外部サービス連携
├── types/               # TypeScript型定義
├── utils/               # ユーティリティ関数
├── store/               # 状態管理
└── workers/             # Service Worker
```

## 機能要件

### 1. PWAアプリケーション機能
- **オフライン対応**: Service Workerによるキャッシュ機能
- **インストール可能**: ホーム画面への追加対応
- **レスポンシブデザイン**: デスクトップ・モバイル対応
- **プッシュ通知**: メモの更新通知（オプション）

### 2. Google Keep連携機能
- **安全な認証**: Google OAuth 2.0による認証
- **メモ一覧表示**: Google Keepのメモを取得・表示
- **メモ詳細表示**: 個別メモの内容表示
- **リアルタイム同期**: Google Keepとの双方向同期

### 3. 付箋表示機能
- **独立ウィンドウ**: 選択したメモを小さな独立画面で表示
- **ドラッグ＆ドロップ**: 付箋の位置移動
- **サイズ調整**: 付箋サイズの変更
- **常に最前面**: 他のアプリケーションの上に表示
- **複数付箋**: 複数のメモを同時に付箋表示

## 詳細設計

### コンポーネント設計

#### 1. 認証関連 (`src/components/auth/`)
```typescript
// LoginButton.tsx
interface LoginButtonProps {
  onLogin: () => Promise<void>;
  isLoading: boolean;
}

// AuthProvider.tsx  
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

#### 2. メモ一覧 (`src/components/notes/`)
```typescript
// NotesList.tsx
interface NotesListProps {
  notes: Note[];
  onNoteSelect: (noteId: string) => void;
  onCreateSticky: (noteId: string) => void;
}

// NoteCard.tsx
interface NoteCardProps {
  note: Note;
  onSelect: () => void;
  onMakeSticky: () => void;
}
```

#### 3. 付箋表示 (`src/components/sticky/`)
```typescript
// StickyNote.tsx
interface StickyNoteProps {
  note: Note;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onPositionChange: (position: Position) => void;
  onSizeChange: (size: Size) => void;
  onClose: () => void;
}

// StickyManager.tsx
interface StickyManagerProps {
  stickyNotes: StickyNote[];
  onUpdateSticky: (id: string, updates: Partial<StickyNote>) => void;
  onCloseSticky: (id: string) => void;
}
```

### データ型定義 (`src/types/`)

```typescript
// Note.ts
interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// StickyNote.ts
interface StickyNote {
  id: string;
  noteId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
}

// User.ts
interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}
```

### API サービス設計 (`src/services/`)

```typescript
// googleKeepApi.ts
class GoogleKeepApiService {
  async authenticate(): Promise<User>;
  async fetchNotes(): Promise<Note[]>;
  async fetchNote(id: string): Promise<Note>;
  async createNote(note: Partial<Note>): Promise<Note>;
  async updateNote(id: string, updates: Partial<Note>): Promise<Note>;
  async deleteNote(id: string): Promise<void>;
}

// stickyService.ts
class StickyService {
  async createSticky(noteId: string): Promise<StickyNote>;
  async updateStickyPosition(id: string, position: Position): Promise<void>;
  async updateStickySize(id: string, size: Size): Promise<void>;
  async closeSticky(id: string): Promise<void>;
  async saveStickiesState(): Promise<void>;
  async loadStickiesState(): Promise<StickyNote[]>;
}
```

## 実装計画

### Phase 1: 基盤構築 (週1-2)
- [ ] プロジェクトセットアップ (Vite + React + TypeScript)
- [ ] PWA設定 (Service Worker, Manifest)
- [ ] 基本的なコンポーネント構造構築
- [ ] TypeScript型定義作成

### Phase 2: Google Keep連携 (週3-4)
- [ ] Google OAuth 2.0認証実装
- [ ] Google Keep API連携
- [ ] メモ一覧表示機能
- [ ] メモ詳細表示機能

### Phase 3: 付箋機能実装 (週5-6)
- [ ] 付箋ウィンドウコンポーネント作成
- [ ] ドラッグ＆ドロップ機能
- [ ] サイズ調整機能
- [ ] 複数付箋管理機能

### Phase 4: 最適化・仕上げ (週7-8)
- [ ] レスポンシブデザイン調整
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング強化
- [ ] ユーザビリティ向上

## セキュリティ要件

### 認証・認可
- Google OAuth 2.0による安全な認証
- アクセストークンの適切な管理
- HTTPS通信の強制

### データ保護
- ローカルストレージの暗号化
- セッション管理の適切な実装
- XSS/CSRF攻撃対策

## パフォーマンス要件

### PWA最適化
- First Contentful Paint < 2秒
- Largest Contentful Paint < 2.5秒
- Cumulative Layout Shift < 0.1
- Service Workerによる効率的なキャッシュ戦略

### メモリ管理
- 付箋の効率的なレンダリング
- 不要なコンポーネントのアンマウント
- メモリリーク防止

## テスト戦略

### 単体テスト
- コンポーネントテスト (React Testing Library)
- ユーティリティ関数テスト (Jest)
- APIサービステスト

### 統合テスト
- 認証フローテスト
- Google Keep API連携テスト
- 付箋機能テスト

### E2Eテスト
- ユーザージャーニーテスト (Playwright)
- PWA機能テスト
- クロスブラウザテスト

## デプロイ・運用

### デプロイ環境
- 静的ホスティング (Vercel, Netlify等)
- CI/CD パイプライン (GitHub Actions)
- 環境変数管理

### 監視・ログ
- エラー監視 (Sentry等)
- パフォーマンス監視
- ユーザー分析

---

## 開発開始チェックリスト

- [ ] Google Cloud Console プロジェクト作成
- [ ] Google Keep API 有効化・認証情報取得
- [ ] 開発環境セットアップ
- [ ] リポジトリ作成・初期コミット
- [ ] 基本的なプロジェクト構造作成