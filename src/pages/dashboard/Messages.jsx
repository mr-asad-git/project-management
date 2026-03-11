import React, { useState } from 'react';
import usersData from '../../data/users';
import UserAvatar from '../../components/ui/UserAvatar';

const SAMPLE_MESSAGES = [
    {
        id: 1, userId: 1,
        preview: 'Hey, can you update the wireframes for the mobile app?',
        time: '9:42 AM',
        unread: 2,
        thread: [
            { from: 'them', text: 'Hey, can you update the wireframes for the mobile app?', time: '9:42 AM' },
            { from: 'me', text: "Sure! I'll have them ready by EOD.", time: '9:45 AM' },
            { from: 'them', text: 'Perfect, thanks! Also ping me when the design system tokens are done.', time: '9:47 AM' },
        ],
    },
    {
        id: 2, userId: 2,
        preview: 'The design review is scheduled for Friday at 2 PM.',
        time: 'Yesterday',
        unread: 0,
        thread: [
            { from: 'them', text: 'The design review is scheduled for Friday at 2 PM.', time: '2:10 PM' },
            { from: 'me', text: "Got it! I'll prepare the slides.", time: '2:15 PM' },
        ],
    },
    {
        id: 3, userId: 3,
        preview: 'Can you do a code review for the TypeScript component?',
        time: 'Mon',
        unread: 1,
        thread: [
            { from: 'them', text: 'Can you do a code review for the TypeScript component?', time: 'Mon 11:00 AM' },
            { from: 'me', text: "Yes, I'll review it this afternoon.", time: 'Mon 11:20 AM' },
            { from: 'them', text: 'Great, check the PR link I shared in Slack.', time: 'Mon 11:22 AM' },
        ],
    },
    {
        id: 4, userId: 4,
        preview: 'QA found a few bugs in the latest build. Sending report.',
        time: 'Sun',
        unread: 0,
        thread: [
            { from: 'them', text: 'QA found a few bugs in the latest build. Sending report.', time: 'Sun 4:00 PM' },
            { from: 'me', text: "Thanks, I'll take a look first thing tomorrow.", time: 'Sun 4:30 PM' },
        ],
    },
    {
        id: 5, userId: 5,
        preview: 'The new onboarding illustrations look amazing! 🎉',
        time: 'Sat',
        unread: 0,
        thread: [
            { from: 'them', text: 'The new onboarding illustrations look amazing! 🎉', time: 'Sat 10:00 AM' },
            { from: 'me', text: 'Glad you like them! Took a while to get the color palette right.', time: 'Sat 10:05 AM' },
            { from: 'them', text: 'The client loved it too. Great work!', time: 'Sat 10:08 AM' },
        ],
    },
];

const Messages = () => {
    const [activeId, setActiveId] = useState(1);
    const [input, setInput] = useState('');
    const [conversations, setConversations] = useState(SAMPLE_MESSAGES);

    const active = conversations.find(c => c.id === activeId);
    const activeUser = usersData.find(u => u.id === active?.userId);

    const send = () => {
        const text = input.trim();
        if (!text) return;
        setConversations(prev => prev.map(c =>
            c.id === activeId
                ? { ...c, preview: text, time: 'Now', unread: 0, thread: [...c.thread, { from: 'me', text, time: 'Now' }] }
                : c
        ));
        setInput('');
    };

    const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

    return (
        <div className="px-6 md:px-12 py-10 flex flex-col gap-8 bg-[#FCFCFD] min-h-screen">

            {/* ── Header ── */}
            <header>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Inbox</span>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-2">Messages</h1>
                <p className="text-slate-500 font-medium mt-1">Stay in sync with your team members.</p>
            </header>

            {/* ── Main chat layout ── */}
            <div className="flex gap-6 h-[70vh]">

                {/* ── Conversation list ── */}
                <div className="w-80 flex-shrink-0 bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input placeholder="Search…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-300 transition-all" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-hide">
                        {conversations.map(conv => {
                            const user = usersData.find(u => u.id === conv.userId);
                            const isActive = conv.id === activeId;
                            const initials = user?.name.split(' ').map(n => n[0]).join('') ?? '?';
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveId(conv.id)}
                                    className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-all duration-200 ${isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <UserAvatar user={user} className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm" />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <p className={`text-sm font-black truncate ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>{user?.name}</p>
                                            <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">{conv.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{conv.preview}</p>
                                    </div>
                                    {conv.unread > 0 && (
                                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">{conv.unread}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Chat panel ── */}
                <div className="flex-1 bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
                    {/* Chat header */}
                    {activeUser && (
                        <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-4">
                            <div className="relative">
                                <UserAvatar user={activeUser} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{activeUser.name}</p>
                                <p className="text-xs text-green-500 font-semibold">● Online</p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-4 scrollbar-hide">
                        {active?.thread.map((msg, i) => (
                            <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                {msg.from === 'them' && (
                                    <UserAvatar
                                        user={activeUser}
                                        className="w-8 h-8 rounded-xl mr-3 mt-auto border border-white shadow-sm flex-shrink-0"
                                    />
                                )}
                                <div className="max-w-[65%]">
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${msg.from === 'me'
                                            ? 'bg-[#5030E5] text-white rounded-br-md'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <p className={`text-[10px] text-slate-400 font-medium mt-1 ${msg.from === 'me' ? 'text-right' : 'text-left'}`}>
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="px-7 py-5 border-t border-slate-100">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Type a message… (Enter to send)"
                                className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                            />
                            <button
                                onClick={send}
                                disabled={!input.trim()}
                                className="p-2 bg-[#5030E5] text-white rounded-xl hover:bg-[#3d22c4] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Messages;
