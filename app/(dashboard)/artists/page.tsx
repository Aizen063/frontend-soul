'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Artist } from '@/types';

export default function ArtistsPage() {
    const ITEMS_PER_PAGE = 10;
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { fetchArtists(); }, []);

    const fetchArtists = async () => {
        try {
            const response = await api.get('/api/artists');
            setArtists(response.data.data);
        } catch (error) {
            console.error('Failed to fetch artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(artists.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedArtists = artists.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div style={{ fontFamily: "var(--font-display)", color: '#00f5ff', fontSize: '0.85rem', letterSpacing: '0.2em', textShadow: '0 0 10px rgba(0,245,255,0.7)' }}>
                    LOADING...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>
                    ARTISTS
                </h1>
                <p style={{ color: 'var(--text-dim)', fontFamily: "var(--font-body)", marginTop: '4px' }}>Browse all artists</p>
            </div>

            {artists.length === 0 ? (
                <div className="text-center py-20" style={{ color: 'var(--text-dim)', fontFamily: "var(--font-body)" }}>
                    No artists found. Ask an admin to add some!
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 md:gap-6">
                        {paginatedArtists.map((artist) => (
                        <Link
                            key={artist._id}
                            href={`/artist/${artist._id}`}
                            className="group flex items-center md:flex-col gap-3 md:gap-0 p-2 md:p-4 rounded-md md:rounded-2xl transition-all duration-300 border-b border-[#1f1f1f] md:border-b-0"
                            style={{
                                background: 'transparent',
                                border: '1px solid transparent'
                            }}
                            onMouseEnter={e => {
                                if (window.matchMedia('(max-width: 768px)').matches) return;
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = 'rgba(13,13,31,0.9)';
                                el.style.border = '1px solid rgba(0,245,255,0.3)';
                                el.style.boxShadow = '0 0 25px rgba(0,245,255,0.1)';
                                el.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                if (window.matchMedia('(max-width: 768px)').matches) return;
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = 'transparent';
                                el.style.border = '1px solid transparent';
                                el.style.boxShadow = 'none';
                                el.style.transform = 'translateY(0)';
                            }}
                        >
                            <div className="w-12 h-12 md:w-40 md:h-40 rounded-full mb-0 md:mb-4 overflow-hidden transition-all duration-500 shrink-0"
                                style={{ border: '2px solid rgba(0,245,255,0.15)', boxShadow: '0 0 15px rgba(0,0,0,0.4)' }}>
                                {artist.photo ? (
                                    <img
                                        src={artist.photo}
                                        alt={artist.name}
                                        className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg md:text-4xl font-bold"
                                        style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.1), rgba(255,0,200,0.1))', color: '#4a4a6a' }}>
                                        {artist.name?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 w-full text-left md:text-center">
                                <h3 className="text-sm md:text-lg font-semibold truncate w-full transition-colors duration-300 md:group-hover:[color:#00f5ff]"
                                    style={{ color: '#ffffff', fontFamily: "var(--font-body)" }}>
                                    {artist.name}
                                </h3>
                                {artist.genre && (
                                    <p className="text-xs md:text-sm mt-0.5 md:mt-1 truncate" style={{ color: 'var(--text-dim)', fontFamily: "var(--font-body)" }}>
                                        {artist.genre}
                                    </p>
                                )}
                            </div>
                        </Link>
                        ))}
                    </div>

                    {artists.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-center gap-2 pt-3">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs rounded-md border border-[#2a2a2a] text-[#bbb] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 text-xs rounded-md border transition-colors"
                                    style={{
                                        borderColor: currentPage === page ? '#1db954' : '#2a2a2a',
                                        background: currentPage === page ? 'rgba(29,185,84,0.15)' : 'transparent',
                                        color: currentPage === page ? '#1db954' : '#bbb'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs rounded-md border border-[#2a2a2a] text-[#bbb] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
