'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUser } = useAuthStore();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile pic upload state
    const [picMessage, setPicMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const formData = new FormData();
        formData.append('profilePic', file);
        formData.append('name', user.name || '');
        formData.append('email', user.email || '');

        setUploading(true);
        setPicMessage(null);
        try {
            const response = await api.put('/api/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateUser({ ...user, ...response.data.data });
            setPicMessage({ type: 'success', text: 'Profile picture updated!' });
        } catch {
            setPicMessage({ type: 'error', text: 'Failed to update profile picture.' });
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwMessage(null);

        if (newPassword.length < 6) {
            setPwMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setPwLoading(true);
        try {
            await api.put('/api/users/change-password', { currentPassword, newPassword });
            setPwMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err: any) {
            setPwMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPwLoading(false);
        }
    };

    const inputStyle = {
        background: '#141414',
        border: '1px solid #333',
        color: '#fff',
    };

    return (
        <div className="space-y-6 max-w-xl pb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-[#888] mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile Settings */}
            <section className="p-5 rounded-xl" style={{ background: '#111', border: '1px solid #222' }}>
                <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden bg-[#222] border-2 border-[#333]">
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.[0]?.toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-[#888]">{user?.email}</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="ml-auto px-4 py-2 rounded-lg text-xs font-medium text-[#ccc] transition-colors hover:bg-[#222] disabled:opacity-50"
                        style={{ background: '#1a1a1a', border: '1px solid #333' }}
                    >
                        {uploading ? 'Uploading...' : 'Change Picture'}
                    </button>
                </div>
                {picMessage && (
                    <div className={`mt-3 flex items-center gap-2 text-xs ${picMessage.type === 'success' ? 'text-[#1db954]' : 'text-red-400'}`}>
                        {picMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                        {picMessage.text}
                    </div>
                )}
            </section>

            {/* Password */}
            <section className="p-5 rounded-xl" style={{ background: '#111', border: '1px solid #222' }}>
                <h2 className="text-sm font-semibold text-white mb-4">Password</h2>

                {pwMessage && (
                    <div className={`mb-4 flex items-center gap-2 text-xs ${pwMessage.type === 'success' ? 'text-[#1db954]' : 'text-red-400'}`}>
                        {pwMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                        {pwMessage.text}
                    </div>
                )}

                {!showPasswordForm ? (
                    <button
                        onClick={() => { setShowPasswordForm(true); setPwMessage(null); }}
                        className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1db954] text-black hover:bg-[#1ed760] transition-colors"
                    >
                        Change Password
                    </button>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-3">
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:border-[#1db954] transition-colors"
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="New password (min 6 chars)"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:border-[#1db954] transition-colors"
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:border-[#1db954] transition-colors"
                            style={inputStyle}
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={pwLoading}
                                className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1db954] text-black hover:bg-[#1ed760] transition-colors disabled:opacity-50"
                            >
                                {pwLoading ? 'Saving...' : 'Save Password'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowPasswordForm(false); setPwMessage(null); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-[#888] hover:bg-[#1a1a1a] transition-colors"
                                style={{ border: '1px solid #333' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
