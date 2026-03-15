// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    profilePic?: string | null;
    likedSongs?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Artist {
    _id: string;
    name: string;
    bio?: string;
    photo?: string;
    genre?: string;
    createdAt?: string;
}

export interface Song {
    _id: string;
    title: string;
    // artist is populated as an object from the backend
    artist: Artist | string;
    album?: string;
    genre?: string;
    audioUrl: string;
    coverImage?: string;
    videoUrl?: string;
    duration?: number;
    lyrics?: string;
    uploadedBy?: Partial<User>;
    createdAt?: string;
    updatedAt?: string;
}

export interface Playlist {
    _id: string;
    name: string;
    user: string | Partial<User>;
    songs: Song[];
    createdAt?: string;
}

// ─── Request / Response DTOs ──────────────────────────────────────────────────

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        _id: string;
        name: string;
        email: string;
        role: 'user' | 'admin';
        token: string;
    };
}

export interface CreateSongRequest {
    title: string;
    artistId: string;
    album?: string;
    genre?: string;
    audio?: File;
    coverImage?: File;
}

export interface CreateArtistRequest {
    name: string;
    bio?: string;
    genre?: string;
    photo?: File;
}

// ─── Helper: get artist name from populated or plain string ───────────────────
export const getArtistName = (artist: Artist | string | undefined): string => {
    if (!artist) return 'Unknown Artist';
    if (typeof artist === 'string') return artist;
    return artist.name || 'Unknown Artist';
};
