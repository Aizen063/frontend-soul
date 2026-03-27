'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import s from '../auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState<{ email: string; password: string }>({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', formData);
            const { token, ...user } = response.data.data;
            login(token, user);
            if (user.role?.toLowerCase() === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.authRoot}>
            <div className={s.shell}>
                <aside className={s.artPane}>
                    <div className={s.artContent}>
                        <img src="/Applogo.png" alt="Soul Sound logo" className={s.artLogo} />
                        <h2 className={s.artTitle}>Music. Mood. Momentum.</h2>
                        <p className={s.artText}>Stream what you love in a clean, distraction-free listening experience.</p>
                    </div>
                </aside>

                <section className={s.cardPane}>
                    <div className={s.card}>
                        <div className={s.logoWrap}>
                            <img src="/Applogo.png" alt="Soul Sound logo" className={s.logoMark} />
                            <h1 className={s.brand}>Soul Sound</h1>
                        </div>

                        <div className={s.header}>
                            <h2 className={s.title}>Welcome back</h2>
                            <p className={s.subtitle}>Sign in to continue your musical journey</p>
                        </div>

                        {error && (
                            <div className={s.error}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={s.form}>
                            <div className={s.field}>
                                <label className={s.label}>Email</label>
                                <div className={s.inputWrap}>
                                    <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={s.input}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={s.field}>
                                <label className={s.label}>Password</label>
                                <div className={s.inputWrap}>
                                    <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={s.input}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button type="button" className={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className={s.btn}>
                                {loading ? (
                                    <span className={s.btnLoading}>
                                        <span className={s.spinner} />
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className={s.divider}><span>or</span></div>

                        <p className={s.switchText}>
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className={s.link}>Create one</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
