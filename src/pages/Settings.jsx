import React, { useState } from 'react';

const Toggle = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-[#5030E5]' : 'bg-slate-200'}`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

const Section = ({ title, description, icon, children }) => (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-[#5030E5]">{icon}</div>
            <div>
                <h2 className="font-black text-slate-900 text-lg">{title}</h2>
                {description && <p className="text-sm text-slate-400 font-medium mt-0.5">{description}</p>}
            </div>
        </div>
        <div className="p-8 flex flex-col gap-6">{children}</div>
    </div>
);

const Field = ({ label, sublabel, children }) => (
    <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-slate-700">{label}</span>
            {sublabel && <span className="text-xs text-slate-400 font-medium">{sublabel}</span>}
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

const INPUT_CLS = "px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 w-64";

const Settings = ({ user, setUser }) => {
    // Local state for the form inputs, initialized from the global 'user' prop
    const [name, setName] = useState(user.name);
    const [location, setLocation] = useState(user.location);
    const [image, setImage] = useState(user.image);

    // Internal UI states
    const [notifs, setNotifs] = useState({ email: true, push: false, taskAssigned: true, taskCompleted: true, mentions: false, weekly: true });
    const [appearance, setAppearance] = useState({ compact: false, animations: true, language: 'en' });
    const [saved, setSaved] = useState(false);

    const save = () => {
        // Update the global user state with only changed data
        setUser(prev => ({
            ...prev,
            name: name,
            location: location,
            image: image
        }));

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="px-6 md:px-12 py-10 flex flex-col gap-10 bg-[#FCFCFD] min-h-screen">

            {/* ── Header ── */}
            <header className="flex items-end justify-between gap-6">
                <div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Preferences</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-2">Settings</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your account preferences and workspace settings.</p>
                </div>
                <button
                    onClick={save}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg ${saved ? 'bg-green-500 text-white shadow-green-200' : 'bg-[#5030E5] text-white hover:bg-[#3d22c4] shadow-indigo-200'}`}
                >
                    {saved ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Saved!
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                            Save Changes
                        </>
                    )}
                </button>
            </header>

            {/* ── Profile Section ── */}
            <Section
                title="Profile"
                description="Update your personal information"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
            >
                {/* Avatar */}
                <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                    <img
                        src={image}
                        alt="Profile"
                        className="w-20 h-20 rounded-[24px] object-cover shadow-lg shadow-indigo-200 ring-4 ring-indigo-50"
                    />
                    <div className="flex flex-col gap-2">
                        <p className="font-black text-slate-900">{name}</p>
                        <p className="text-sm text-slate-400 font-medium">{location}</p>
                        <label className="text-xs font-bold text-[#5030E5] hover:underline cursor-pointer">
                            Change avatar
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setImage(reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={INPUT_CLS + ' w-full'}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className={INPUT_CLS + ' w-full'}
                        />
                    </div>
                </div>
            </Section>

            {/* ── Notifications ── */}
            <Section
                title="Notifications"
                description="Control how and when you're notified"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}
            >
                {[
                    { key: 'email', label: 'Email Notifications', sublabel: 'Receive updates via email' },
                    { key: 'push', label: 'Push Notifications', sublabel: 'Browser push alerts' },
                    { key: 'taskAssigned', label: 'Task Assigned', sublabel: 'When a task is assigned to you' },
                    { key: 'taskCompleted', label: 'Task Completed', sublabel: 'When a task you own is completed' },
                    { key: 'mentions', label: '@Mentions', sublabel: 'When someone mentions you' },
                    { key: 'weekly', label: 'Weekly Digest', sublabel: 'Summary of activity every Monday' },
                ].map(item => (
                    <div key={item.key}>
                        <Field label={item.label} sublabel={item.sublabel}>
                            <Toggle
                                checked={notifs[item.key]}
                                onChange={val => setNotifs(n => ({ ...n, [item.key]: val }))}
                            />
                        </Field>
                        <div className="h-px bg-slate-50 mt-4 last:hidden" />
                    </div>
                ))}
            </Section>

            {/* ── Appearance ── */}
            <Section
                title="Appearance"
                description="Customize how the app looks and feels"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>}
            >
                <Field label="Compact Mode" sublabel="Reduce spacing and padding throughout the app">
                    <Toggle checked={appearance.compact} onChange={val => setAppearance(a => ({ ...a, compact: val }))} />
                </Field>
                <div className="h-px bg-slate-50" />
                <Field label="Animations" sublabel="Enable transition and micro-animations">
                    <Toggle checked={appearance.animations} onChange={val => setAppearance(a => ({ ...a, animations: val }))} />
                </Field>
                <div className="h-px bg-slate-50" />
                <Field label="Language" sublabel="Display language for the interface">
                    <select
                        value={appearance.language}
                        onChange={e => setAppearance(a => ({ ...a, language: e.target.value }))}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 bg-slate-50 cursor-pointer"
                    >
                        <option value="en">English</option>
                        <option value="ur">Urdu</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>
                </Field>
            </Section>

            {/* ── Danger Zone ── */}
            <div className="bg-white rounded-[28px] border-2 border-red-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-red-100 flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <div>
                        <h2 className="font-black text-red-700 text-lg">Danger Zone</h2>
                        <p className="text-sm text-red-400 font-medium mt-0.5">Irreversible account actions</p>
                    </div>
                </div>
                <div className="p-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <p className="font-bold text-slate-800">Delete Account</p>
                        <p className="text-sm text-slate-400 font-medium mt-1">Permanently delete your account and all associated data. This cannot be undone.</p>
                    </div>
                    <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-red-200 h-fit self-center">
                        Delete Account
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Settings;
