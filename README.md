# Soul Sound Frontend

A modern, attractive Next.js music streaming application with admin capabilities.

## Features

### User Features
- 🎵 Browse and discover music
- 🔍 Search for songs, artists, and playlists
- 📚 Personal library with playlists and liked songs
- 🎨 Beautiful dark-themed UI with glassmorphism
- 🎧 Global music player
- ⚙️ User settings and customization

### Admin Features
- 👥 User management
- 🎵 Song management (upload, edit, delete)
- 🎤 Artist management
- 📝 Playlist management
- 📊 Statistics dashboard

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (dashboard)/     # User dashboard pages
│   ├── (admin)/         # Admin panel pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   └── layout/          # Layout components (Sidebar, Header, Player)
├── lib/
│   ├── api.ts           # Axios API client
│   └── utils.ts         # Utility functions
├── store/
│   └── authStore.ts     # Authentication state (Zustand)
└── types/
    └── index.ts         # TypeScript type definitions
```

## API Integration

The frontend connects to the Soul Sound backend API at `http://localhost:5000`.

### Key Endpoints Used:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/songs` - Fetch all songs
- `GET /api/artists` - Fetch all artists
- `GET /api/playlists` - Fetch all playlists
- `GET /api/users` - Fetch all users (admin only)

## User Accounts

### Test Users
Create accounts via the registration page or use existing backend users.

### Admin Access
Users with `role: "admin"` in the database will see the "Admin Panel" link in the sidebar and have access to `/admin/*` routes.

## Features Implemented

### Phase 1: Authentication ✅
- Login page with role-based redirect
- Registration page
- JWT token management
- Protected routes

### Phase 2: Dashboard Layout ✅
- Responsive sidebar navigation
- Header with logout
- Global music player (UI only - playback to be implemented)

### Phase 3: User Pages ✅
- Home page with song grid
- Library page
- Search page with genre browsing
- Settings page

### Phase 4: Admin Panel ✅
- Admin dashboard with statistics
- Protected admin routes

## Next Steps

1. **Implement Audio Playback**: Integrate Howler.js or HTML5 Audio for actual music playback
2. **Complete Admin CRUD**: Add full create/edit/delete functionality for songs, artists, users
3. **File Uploads**: Implement file upload UI for songs, covers, and profile pictures
4. **Enhanced Features**:
   - Playlist creation and management
   - Like/unlike songs
   - Artist and playlist detail pages
   - Real-time search
   - Advanced audio controls (shuffle, repeat, queue)
5. **Polish**:
   - Loading states and skeletons
   - Error handling with toast notifications
   - Responsive design improvements
   - Animations and transitions

## Design System

- **Primary Colors**: Purple (#8B5CF6) to Cyan (#06B6D4) gradients
- **Background**: Dark slate (#0F172A, #1E293B)
- **Effects**: Glassmorphism, backdrop blur
- **Typography**: System fonts optimized by Next.js

## Known Issues

- Music playback not yet implemented (player UI only)
- Admin CRUD operations need completion
- File upload functionality not connected
- Mobile responsive needs refinement

## Contributing

This is a project for the Soul Sound music platform. Follow the existing code patterns and design system when adding new features.

## License

© 2026 Soul Sound. All rights reserved.
