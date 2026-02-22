import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { suggestSkills, saveSkills } from '../../api/db';

interface Props {
    userId: string;
    onClose: () => void;
    onSaved: () => void;
}

export const SuggestSkillsModal: React.FC<Props> = ({ userId, onClose, onSaved }) => {
    const [interest, setInterest] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSuggest = async () => {
        if (!interest.trim()) return;
        setIsSuggesting(true);
        setError('');
        setSuggestions([]);
        setSelected(new Set());
        try {
            const res = await suggestSkills(userId, interest.trim());
            setSuggestions(res.skills || []);
        } catch (e) {
            setError('Failed to fetch suggestions. Please try again.');
        } finally {
            setIsSuggesting(false);
        }
    };

    const toggleSkill = (skill: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(skill) ? next.delete(skill) : next.add(skill);
            return next;
        });
    };

    const handleSave = async () => {
        if (selected.size === 0) return;
        setIsSaving(true);
        setError('');
        try {
            await saveSkills(userId, Array.from(selected));
            onSaved();
            onClose();
        } catch (e) {
            setError('Failed to save skills. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Discover New Skills</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered suggestions just for you</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Interest input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            What are you interested in?
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={interest}
                                onChange={e => setInterest(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSuggest()}
                                placeholder="e.g. web development, data science…"
                                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSuggest}
                                disabled={!interest.trim() || isSuggesting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isSuggesting ? 'Thinking…' : 'Suggest'}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Select skills to add ({selected.size} selected)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(skill => {
                                    const isSelected = selected.has(skill);
                                    return (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${isSelected
                                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                                                }`}
                                        >
                                            {isSelected
                                                ? <Check className="w-3.5 h-3.5" />
                                                : <Plus className="w-3.5 h-3.5" />
                                            }
                                            {skill}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={selected.size === 0 || isSaving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-colors"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isSaving ? 'Saving…' : `Save ${selected.size > 0 ? `(${selected.size})` : ''} Skills`}
                    </button>
                </div>
            </div>
        </div>
    );
};
