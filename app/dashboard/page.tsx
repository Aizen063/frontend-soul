'use client';

import { useEffect, useState } from 'react';
import { Music, Clock, Heart, ListMusic, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/api';

interface UserStats {
    totalSongsListened: number;
    totalListeningTimeMinutes: number;
    favoriteGenre: string;
    songsLiked: number;
    playlistsCreated: number;
}

interface ListeningActivity {
    date: string;
    plays: number;
}

interface GenreData {
    genre: string;
    count: number;
}

interface ArtistData {
    artistName: string;
    playCount: number;
}

const CHART_COLORS = ['#1db954', '#1ed760', '#6ee7a8', '#34d399', '#86efac'];

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [listeningActivity, setListeningActivity] = useState<ListeningActivity[]>([]);
    const [topGenres, setTopGenres] = useState<GenreData[]>([]);
    const [topArtists, setTopArtists] = useState<ArtistData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [likedRes, historyRes, playlistsRes] = await Promise.all([
                api.get('/api/users/liked'),
                api.get('/api/users/history'),
                api.get('/api/playlists'),
            ]);

            const likedSongs: any[] = likedRes.data?.data || [];
            const history: any[] = historyRes.data?.data || [];
            const playlists: any[] = playlistsRes.data?.data || [];

            const genreMap = new Map<string, number>();
            likedSongs.forEach((song: any) => {
                const genre = song.genre || 'Unknown';
                genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
            });
            const genreData: GenreData[] = Array.from(genreMap.entries())
                .map(([genre, count]) => ({ genre, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const artistMap = new Map<string, number>();
            likedSongs.forEach((song: any) => {
                const artist = (typeof song.artist === 'object' ? song.artist?.name : null) || 'Unknown Artist';
                artistMap.set(artist, (artistMap.get(artist) || 0) + 1);
            });
            const artistData: ArtistData[] = Array.from(artistMap.entries())
                .map(([artistName, playCount]) => ({ artistName, playCount }))
                .sort((a, b) => b.playCount - a.playCount)
                .slice(0, 5);

            const activityData: ListeningActivity[] = [];
            for (let i = 6; i >= 0; i--) {
                const target = new Date();
                target.setDate(target.getDate() - i);
                const dateStr = `${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
                const plays = history.filter((item: any) => {
                    if (!item?.playedAt) return false;
                    const d = new Date(item.playedAt);
                    return d.getDate() === target.getDate() &&
                        d.getMonth() === target.getMonth() &&
                        d.getFullYear() === target.getFullYear();
                }).length;
                activityData.push({ date: dateStr, plays });
            }

            setStats({
                totalSongsListened: history.length,
                totalListeningTimeMinutes: history.length * 3,
                favoriteGenre: genreData[0]?.genre || 'N/A',
                songsLiked: likedSongs.length,
                playlistsCreated: playlists.length,
            });
            setListeningActivity(activityData);
            setTopGenres(genreData);
            setTopArtists(artistData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ totalSongsListened: 0, totalListeningTimeMinutes: 0, favoriteGenre: 'N/A', songsLiked: 0, playlistsCreated: 0 });
            setListeningActivity([]);
            setTopGenres([]);
            setTopArtists([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1db954] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8 animate-fade-in">
            <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', border: '1px solid #222' }}>
                <h1 className="text-3xl font-bold text-white mb-1">Your Dashboard</h1>
                <p className="text-[#aaa]">Track your listening habits and discover insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={<Music className="w-6 h-6" />} title="Songs Played" value={stats?.totalSongsListened || 0} color="green" />
                <StatCard icon={<Clock className="w-6 h-6" />} title="Hours Played" value={Math.round((stats?.totalListeningTimeMinutes || 0) / 60)} suffix=" hrs" color="mint" />
                <StatCard icon={<TrendingUp className="w-6 h-6" />} title="Favorite Genre" value={stats?.favoriteGenre || 'N/A'} isText color="emerald" />
                <StatCard icon={<Heart className="w-6 h-6" />} title="Songs Liked" value={stats?.songsLiked || 0} color="lime" />
                <StatCard icon={<ListMusic className="w-6 h-6" />} title="Playlists" value={stats?.playlistsCreated || 0} color="olive" />
            </div>

            <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Listening Activity (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={listeningActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                        <XAxis dataKey="date" stroke="#9b9b9b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9b9b9b" style={{ fontSize: '12px' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #2f2f2f', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="plays" stroke="#1db954" strokeWidth={3} dot={{ fill: '#1db954', r: 4 }} activeDot={{ r: 7 }} name="Songs played" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                    <h2 className="text-xl font-bold text-white mb-4">Top Genres (Liked)</h2>
                    {topGenres.length === 0 ? (
                        <p className="text-[#666] text-sm py-8 text-center">Like some songs to see your genre stats</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={topGenres} cx="50%" cy="50%" labelLine={false} label={false} outerRadius={88} fill="#8884d8" dataKey="count">
                                    {topGenres.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #2f2f2f', borderRadius: '8px', color: '#fff' }} formatter={(value, _name, props) => [value, props.payload?.genre]} />
                                <Legend formatter={(_value, entry: any) => entry.payload?.genre || _value} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                    <h2 className="text-xl font-bold text-white mb-4">Top Artists (Liked)</h2>
                    {topArtists.length === 0 ? (
                        <p className="text-[#666] text-sm py-8 text-center">Like some songs to see your artist stats</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topArtists} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                                <XAxis type="number" stroke="#9b9b9b" style={{ fontSize: '12px' }} allowDecimals={false} />
                                <YAxis dataKey="artistName" type="category" stroke="#9b9b9b" width={110} style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #2f2f2f', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="playCount" fill="#1db954" name="Liked songs" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    suffix?: string;
    isText?: boolean;
    color: 'green' | 'mint' | 'emerald' | 'lime' | 'olive';
}

function StatCard({ icon, title, value, suffix = '', isText = false, color }: StatCardProps) {
    const colorClasses = {
        green: 'from-[#1db954]/20 to-[#1db954]/5 border-[#1db954]/30 text-[#1db954]',
        mint: 'from-[#1ed760]/20 to-[#1ed760]/5 border-[#1ed760]/30 text-[#1ed760]',
        emerald: 'from-[#10b981]/20 to-[#10b981]/5 border-[#10b981]/30 text-[#10b981]',
        lime: 'from-[#84cc16]/20 to-[#84cc16]/5 border-[#84cc16]/30 text-[#84cc16]',
        olive: 'from-[#65a30d]/20 to-[#65a30d]/5 border-[#65a30d]/30 text-[#65a30d]',
    };

    return (
        <div className={`rounded-xl p-4 md:p-6 border bg-gradient-to-br ${colorClasses[color]}`} style={{ backgroundColor: '#111' }}>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/10">{icon}</div>
                <h3 className="text-sm text-[#aaa] font-medium">{title}</h3>
            </div>
            <p className={`font-bold text-white ${isText ? 'text-xl' : 'text-3xl'}`}>
                {value}{suffix}
            </p>
        </div>
    );
}
