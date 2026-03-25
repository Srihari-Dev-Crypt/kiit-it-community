# KIIT IT — Anonymous Student Community Platform

> An anonymous-first student community where users can express themselves freely, get answers, and connect with peers — without fear of judgment.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS + shadcn/ui** | Styling & accessible components |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Data fetching, caching, server state |
| **React Hook Form + Zod** | Form handling & validation |
| **Lucide React** | Icons |
| **date-fns** | Date formatting |
| **Sonner** | Toast notifications |

### Backend (Supabase)
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database |
| **Supabase Auth** | Email/password authentication |
| **Supabase Realtime** | WebSocket subscriptions for live updates |
| **Row Level Security (RLS)** | Database-level access control |
| **SQL Views** | Anonymity layer (`posts_public`) |
| **RPC Functions** | Server-side vote/comment counting |
| **Database Triggers** | Auto-create profile on signup |

---

## Pages (12 Routes)

| Route | Component | Auth | Description |
|---|---|---|---|
| `/` | `Index` | No | Landing — hero, features, recent posts, stats, CTA |
| `/login` | `Login` | No | Email/password login |
| `/signup` | `Signup` | No | Registration with password strength indicator |
| `/confessions` | `Confessions` | Yes | Confession feed (sort: New/Hot/Top) |
| `/questions` | `Questions` | Yes | Q&A feed (sort: Newest/Unanswered/Top) |
| `/communities` | `Communities` | Yes | Community grid |
| `/community/:id` | `CommunityDetail` | Yes | Community posts & rules |
| `/create` | `CreatePost` | Yes | Post creation with type/community/anonymity selector |
| `/post/:id` | `PostDetail` | Yes | Full post with voting, comments |
| `/notifications` | `Notifications` | Yes | Notification inbox |
| `/profile` | `Profile` | Yes | Profile/Privacy/Settings tabs |
| `/my-posts` | `MyPosts` | Yes | User's own posts with type filters |

---

## Components

### Layout
- **`Layout`** — Wraps pages with Navbar + MobileNav, initializes realtime hooks
- **`Navbar`** — Top bar with KIIT IT logo, nav pills, auth buttons, notification badge
- **`MobileNav`** — Fixed bottom nav with floating "Post" action button

### Feature Components
- **`PostCard`** — Post with voting, type badge, identity display, comment count, share
- **`ShareMenu`** — Copy Link / Twitter / Facebook / Email sharing
- **`CommentCard`** — Comment with voting, identity, "Best Answer" badge
- **`ProtectedRoute`** — Redirects unauthenticated users to `/login`

### Custom Hooks
- **`useAuth`** — Auth context (signUp, signIn, signOut, user/session)
- **`useVote`** — Optimistic voting for posts & comments
- **`useUnreadCount`** — Polls unread notifications every 30s
- **`useRealtimePosts`** — Subscribes to post changes
- **`useRealtimeComments`** — Subscribes to comment changes per post
- **`useRealtimeNotifications`** — Live notification alerts via toast

---

## Database Schema

### Tables

**`profiles`** — `user_id`, `display_name`, `bio`, `avatar_url`, `is_anonymous_default`

**`communities`** — `name`, `description`, `icon`, `rules[]`, `member_count`

**`posts`** — `user_id`, `title`, `content`, `post_type` (confession/question/rant/advice/discussion), `identity_type` (anonymous/pseudonymous/named), `pseudonym`, `community_id`, `upvotes`, `downvotes`, `comment_count`

**`comments`** — `post_id`, `user_id`, `parent_id`, `content`, `identity_type`, `pseudonym`, `upvotes`, `downvotes`, `is_best_answer`

**`votes`** — `user_id`, `post_id`, `comment_id`, `vote_type` (1 or -1). Unique constraints: `(user_id, post_id)` and `(user_id, comment_id)`

**`notifications`** — `user_id`, `type` (comment/upvote/mention/general), `title`, `message`, `related_post_id`, `is_read`

---

## Anonymity System — How It Works

Anonymity is enforced at **three levels**:

### 1. Database Column — `identity_type`
Every post/comment stores: `anonymous`, `pseudonymous`, or `named`.

### 2. SQL View — `posts_public` (Core Mechanism)
The frontend **never queries `posts` directly** for public feeds. It uses:

```sql
CREATE VIEW posts_public AS
SELECT
  id,
  CASE WHEN identity_type = 'anonymous' THEN NULL ELSE user_id END AS user_id,
  title, content, post_type, identity_type, pseudonym,
  community_id, upvotes, downvotes, comment_count,
  created_at, updated_at
FROM posts;
```

When `identity_type = 'anonymous'`, the `user_id` is **replaced with NULL** at the database level. Even inspecting network requests reveals nothing. The real `user_id` remains in the `posts` table so users can manage their own posts via `/my-posts`.

### 3. Frontend Display
`PostCard`/`CommentCard` show: 🔒 "Anonymous" (eye-off icon), 🎭 pseudonym, or 👤 "User" based on `identity_type`.

### 4. Per-Action Toggle
Users choose anonymity on **every post and comment** independently via a Switch toggle.

---

## SQL Components

### RPC Functions (`SECURITY DEFINER`)
| Function | Purpose |
|---|---|
| `update_post_votes(_post_id, _upvotes, _downvotes)` | Update post vote counts |
| `update_comment_votes(_comment_id, _upvotes, _downvotes)` | Update comment vote counts |
| `increment_comment_count(_post_id)` | Increment post's comment count |

### Trigger
`on_auth_user_created` → `handle_new_user()` — auto-creates a `profiles` row on signup.

### RLS Policies
- **profiles**: View all (authenticated), update own
- **communities**: View all (authenticated)
- **posts**: View all, create/update/delete own
- **comments**: View all, create/update/delete own
- **votes**: View/create/update/delete own only
- **notifications**: View/update/delete own only

### Realtime
`posts`, `comments`, and `notifications` tables are added to `supabase_realtime` publication.

### Seed Data
8 communities: Campus Life, Academics, Tech & Coding, Placements, Mental Health, Sports, Memes & Fun, Lost & Found.

---

## Project Structure

```
src/
├── assets/              # Logo
├── components/
│   ├── auth/            # ProtectedRoute
│   ├── comments/        # CommentCard
│   ├── layout/          # Layout, Navbar, MobileNav
│   ├── posts/           # PostCard, ShareMenu
│   └── ui/              # shadcn/ui components
├── hooks/               # useAuth, useVote, useRealtime*, useUnreadCount
├── integrations/supabase/  # Supabase client
├── pages/               # 12 page components
├── index.css            # Design system (HSL tokens, custom utilities)
├── App.tsx              # Root with routing
└── main.tsx             # Entry point
