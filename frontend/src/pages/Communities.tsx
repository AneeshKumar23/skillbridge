import React, { useState } from 'react';
import { ArrowLeft, Users, Search, MessageCircle, ExternalLink, TrendingUp, Globe, Zap } from 'lucide-react';

interface CommunityProps {
    onBack: () => void;
}

interface Community {
    id: number;
    name: string;
    description: string;
    members: number;
    platform: 'discord' | 'reddit' | 'slack' | 'forum';
    category: string;
    active: boolean;
    badge?: string;
    url?: string;
    color: string;
}

const communities: Community[] = [
    {
        id: 1,
        name: 'Python Developers',
        description: 'A vibrant community for Python enthusiasts — from scripting to ML and beyond.',
        members: 124500,
        platform: 'discord',
        category: 'Programming',
        active: true,
        badge: 'Top Community',
        color: 'from-yellow-400 to-yellow-600',
        url: 'https://discord.gg/python',
    },
    {
        id: 2,
        name: 'React & Frontend',
        description: 'Discuss React, Next.js, TypeScript and everything frontend.',
        members: 98200,
        platform: 'discord',
        category: 'Web Dev',
        active: true,
        badge: 'Hot 🔥',
        color: 'from-cyan-400 to-blue-600',
        url: 'https://discord.gg/reactiflux',
    },
    {
        id: 3,
        name: 'r/learnprogramming',
        description: 'A supportive subreddit for learning programming at every level.',
        members: 3400000,
        platform: 'reddit',
        category: 'General',
        active: true,
        color: 'from-orange-400 to-red-500',
        url: 'https://reddit.com/r/learnprogramming',
    },
    {
        id: 4,
        name: 'FastAPI Community',
        description: 'Official community for FastAPI — modern, fast Python web framework.',
        members: 21300,
        platform: 'discord',
        category: 'Backend',
        active: true,
        color: 'from-green-400 to-emerald-600',
        url: 'https://discord.gg/fastapi',
    },
    {
        id: 5,
        name: 'Machine Learning',
        description: 'Explore ML papers, projects, tools and career advice.',
        members: 275000,
        platform: 'slack',
        category: 'AI / ML',
        active: true,
        badge: 'Growing ↑',
        color: 'from-purple-400 to-violet-600',
    },
    {
        id: 6,
        name: 'TypeScript Community',
        description: 'All things TypeScript — type wizardry, tooling, and best practices.',
        members: 44700,
        platform: 'discord',
        category: 'Web Dev',
        active: false,
        color: 'from-blue-400 to-indigo-600',
        url: 'https://discord.gg/typescript',
    },
    {
        id: 7,
        name: 'DevOps & Cloud',
        description: 'CI/CD, Kubernetes, AWS, GCP — infra talk for modern engineers.',
        members: 61000,
        platform: 'slack',
        category: 'Infrastructure',
        active: true,
        color: 'from-gray-400 to-slate-600',
    },
    {
        id: 8,
        name: 'Open Source Crafters',
        description: 'Find projects, contributors and OSS mentorship opportunities.',
        members: 18900,
        platform: 'forum',
        category: 'General',
        active: true,
        badge: 'New ✨',
        color: 'from-pink-400 to-rose-600',
    },
];

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
    if (platform === 'discord')
        return (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
        );
    if (platform === 'reddit')
        return (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
        );
    if (platform === 'slack') return <MessageCircle className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
};

const platformLabel: Record<string, string> = {
    discord: 'Discord',
    reddit: 'Reddit',
    slack: 'Slack',
    forum: 'Forum',
};

const platformColors: Record<string, string> = {
    discord: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    reddit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    slack: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    forum: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const formatMembers = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const categories = ['All', ...Array.from(new Set(communities.map(c => c.category)))];

export const Communities: React.FC<CommunityProps> = ({ onBack }) => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = communities.filter(c => {
        const matchSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase());
        const matchCategory = activeCategory === 'All' || c.category === activeCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-4 shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">Communities</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Connect with fellow learners</p>
                    </div>
                </div>
            </div>

            {/* Hero banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-8 text-white">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-300" />
                        <span className="text-sm font-medium text-blue-200">Learn together, grow faster</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Find your community</h2>
                    <p className="text-blue-200 text-sm mb-5">
                        Join thousands of learners already sharing knowledge, asking questions, and building projects.
                    </p>
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                        <input
                            type="text"
                            placeholder="Search communities…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Category chips */}
            <div className="px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Stats row */}
            <div className="px-6 py-3 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{filtered.length} communities</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{formatMembers(filtered.reduce((s, c) => s + c.members, 0))} members total</span>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No communities found for "{search}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                        {filtered.map(community => (
                            <div
                                key={community.id}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow flex flex-col"
                            >
                                {/* Card banner */}
                                <div className={`h-16 bg-gradient-to-r ${community.color} relative`}>
                                    {community.badge && (
                                        <span className="absolute top-2 right-2 bg-white/90 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                            {community.badge}
                                        </span>
                                    )}
                                    {!community.active && (
                                        <span className="absolute top-2 left-2 bg-black/30 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                            Quiet
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    {/* Platform + category */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${platformColors[community.platform]}`}>
                                            <PlatformIcon platform={community.platform} />
                                            {platformLabel[community.platform]}
                                        </span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{community.category}</span>
                                    </div>

                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{community.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">
                                        {community.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{formatMembers(community.members)}</span>
                                        </div>
                                        {community.url ? (
                                            <a
                                                href={community.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg transition-colors"
                                            >
                                                Join <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <button className="text-xs font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg transition-colors">
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
