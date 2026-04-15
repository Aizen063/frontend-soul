'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import s from '../auth.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB.'); return; }
        setError('');
        setProfilePic(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemovePic = () => {
        setProfilePic(null);
        setProfilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            await api.post('/api/auth/register', {
                name: formData.username,
                email: formData.email,
                password: formData.password,
            });
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = formData.password.length >= 10 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak';
    const passwordMatch = formData.confirmPassword
        ? formData.password === formData.confirmPassword
        : null;

    return (
        <div className={s.authRoot}>
            <div className={s.shell}>
                <aside className={s.artPane}>
                    <div className={s.artContent}>
                        <img src="/Soullogo.png" alt="Soul Sound logo" className={s.artLogo} />
                        <h2 className={s.artTitle}>Start your sound journey.</h2>
                        <p className={s.artText}>Create your profile and step into a cleaner, focused music experience.</p>
                    </div>
                </aside>

                <section className={s.cardPane}>
                    <div className={s.card}>
                        <div className={s.logoWrap}>
                            <img src="/Soullogo.png" alt="Soul Sound logo" className={s.logoMark} />
                            <h1 className={s.brand}>Soul Sound</h1>
                        </div>

                        <div className={s.header}>
                            <h2 className={s.title}>Create your account</h2>
                            <p className={s.subtitle}>Join music lovers and make every session yours</p>
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
                            <div className={s.profileSection}>
                                <div className={s.profileRow}>
                                    <div className={s.profileRing}>
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile preview" className={s.previewImg} />
                                        ) : (
                                            <div className={s.placeholder}>Photo</div>
                                        )}
                                    </div>
                                    <div className={s.uploadMeta}>
                                        <span className={s.uploadLabel}>Profile picture</span>
                                        <span className={s.uploadHint}>JPG, PNG or GIF · Max 5MB</span>
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicChange} className={s.fileInput} />
                                {profilePic && (
                                    <button type="button" className={s.removeBtn} onClick={handleRemovePic}>
                                        Remove selected image
                                    </button>
                                )}
                            </div>

                    {/* Username */}
                    <div className={s.field}>
                        <label className={s.label}>Username</label>
                        <div className={s.inputWrap}>
                            <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            <input type="text" value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className={s.input} placeholder="Your display name" required />
                        </div>
                    </div>

                    {/* Email */}
                    <div className={s.field}>
                        <label className={s.label}>Email</label>
                        <div className={s.inputWrap}>
                            <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <input type="email" value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={s.input} placeholder="you@example.com" required />
                        </div>
                    </div>

                    {/* Password */}
                    <div className={s.field}>
                        <label className={s.label}>Password</label>
                        <div className={s.inputWrap}>
                            <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input type={showPassword ? 'text' : 'password'} value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={s.input} placeholder="Min. 6 characters" required />
                            <button type="button" className={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword
                                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                        {formData.password && (
                            <div className={s.strengthWrap}>
                                <div className={`${s.strengthBar} ${s[passwordStrength]}`} />
                                <span className={s.strengthLabel}>
                                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className={s.field}>
                        <label className={s.label}>Confirm Password</label>
                        <div className={s.inputWrap}>
                            <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className={`${s.input} ${passwordMatch === false ? s.inputError : passwordMatch === true ? s.inputSuccess : ''}`}
                                placeholder="Re-enter your password"
                                required
                            />
                            <button type="button" className={s.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm
                                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                    </div>

                            <button type="submit" disabled={loading} className={s.btn}>
                                {loading ? (
                                    <span className={s.btnLoading}>
                                        <span className={s.spinner} />
                                        Creating account...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div className={s.divider}><span>or</span></div>

                        <p className={s.switchText}>
                            Already have an account?{' '}
                            <Link href="/login" className={s.link}>Sign in</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
