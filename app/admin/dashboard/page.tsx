'use client';

import { useEffect, useState } from 'react';
import { Users, Music, Mic2, ListMusic, HardDrive } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/api';

interface AdminStats {
    totalUsers: number;
    totalSongs: number;
    totalArtists: number;
    totalPlaylists: number;
    storageUsedGB: number;
}

interface UserGrowth {
    date: string;
    newUsers: number;
    totalUsers: number;
}

interface SongUploadTrend {
    date: string;
    songs: number;
}

interface TopSong {
    songId: string;
    songTitle: string;
    artistName: string;
    likeCount: number;
}

interface GenreData {
    genre: string;
    count: number;
}

const CHART_COLORS = ['#1db954', '#1ed760', '#6ee7a8', '#34d399', '#86efac'];

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
    const [songUploadTrend, setSongUploadTrend] = useState<SongUploadTrend[]>([]);
    const [topSongs, setTopSongs] = useState<TopSong[]>([]);
    const [genreDistribution, setGenreDistribution] = useState<GenreData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/users/admin/stats');
            const d = res.data?.data;
            setStats({
                totalUsers: d.totalUsers,
                totalSongs: d.totalSongs,
                totalArtists: d.totalArtists,
                totalPlaylists: d.totalPlaylists,
                storageUsedGB: d.storageUsedGB,
            });
            setUserGrowth(d.userGrowth || []);
            setSongUploadTrend(d.songUploadTrend || []);
            setGenreDistribution(d.genreDistribution || []);
            setTopSongs(d.topLikedSongs || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setStats({ totalUsers: 0, totalSongs: 0, totalArtists: 0, totalPlaylists: 0, storageUsedGB: 0 });
            setUserGrowth([]);
            setSongUploadTrend([]);
            setTopSongs([]);
            setGenreDistribution([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1db954] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8 animate-fade-in">
            {/* Header */}
            <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', border: '1px solid #222' }}>
                <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                <p className="text-[#aaa]">Platform analytics and insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard
                    icon={<Users className="w-6 h-6" />}
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    color="green"
                />
                <StatCard
                    icon={<Music className="w-6 h-6" />}
                    title="Total Songs"
                    value={stats?.totalSongs || 0}
                    color="mint"
                />
                <StatCard
                    icon={<Mic2 className="w-6 h-6" />}
                    title="Total Artists"
                    value={stats?.totalArtists || 0}
                    color="emerald"
                />
                <StatCard
                    icon={<ListMusic className="w-6 h-6" />}
                    title="Total Playlists"
                    value={stats?.totalPlaylists || 0}
                    color="lime"
                />
                <StatCard
                    icon={<HardDrive className="w-6 h-6" />}
                    title="Storage Used"
                    value={stats?.storageUsedGB?.toFixed(2) || '0.00'}
                    suffix=" GB"
                    isText
                    color="olive"
                />
            </div>

            {/* User Growth Chart */}
            <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">User Growth Over Time</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                        <XAxis
                            dataKey="date"
                            stroke="#9b9b9b"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9b9b9b"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111',
                                border: '1px solid #2f2f2f',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="newUsers"
                            stroke="#34d399"
                            strokeWidth={2}
                            name="New Users"
                        />
                        <Line
                            type="monotone"
                            dataKey="totalUsers"
                            stroke="#1db954"
                            strokeWidth={3}
                            name="Total Users"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Song Upload Trend Chart */}
            <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Song Uploads (Last 6 Months)</h2>
                {songUploadTrend.length === 0 ? (
                    <p className="text-[#666] text-sm py-8 text-center">No upload data yet</p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={songUploadTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                            <XAxis dataKey="date" stroke="#9b9b9b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9b9b9b" style={{ fontSize: '12px' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #2f2f2f', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="songs" fill="#1db954" name="Songs Uploaded" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Genre Distribution */}
                <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Genre Distribution</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={genreDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={false}
                                outerRadius={88}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {genreDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111',
                                    border: '1px solid #2f2f2f',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Songs Table */}
                <div className="rounded-xl p-4 md:p-6" style={{ background: '#111', border: '1px solid #222' }}>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Top 5 Most Liked Songs</h2>
                    <div className="space-y-3">
                        {topSongs.slice(0, 5).map((song, index) => (
                            <div
                                key={String(song.songId)}
                                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg transition-all"
                                style={{ background: '#181818', border: '1px solid #252525' }}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold" style={{ background: 'linear-gradient(135deg, #1db954, #15803d)' }}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white truncate">{song.songTitle}</h4>
                                    <p className="text-sm text-[#888] truncate">{song.artistName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#1db954] font-bold">{song.likeCount}</p>
                                    <p className="text-xs text-[#888]">likes</p>
                                </div>
                            </div>
                        ))}
                    </div>
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
        olive: 'from-[#65a30d]/20 to-[#65a30d]/5 border-[#65a30d]/30 text-[#65a30d]'
    };

    return (
        <div className={`rounded-xl p-4 md:p-6 border bg-gradient-to-br ${colorClasses[color]}`} style={{ backgroundColor: '#111' }}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white/10`}>
                    {icon}
                </div>
                <h3 className="text-sm text-[#aaa] font-medium">{title}</h3>
            </div>
            <p className={`text-2xl md:text-3xl font-bold ${isText ? 'text-lg md:text-xl' : ''}`}>
                {value}{suffix}
            </p>
        </div>
    );
}
