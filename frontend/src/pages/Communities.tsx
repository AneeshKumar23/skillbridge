import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Users, Search, MessageCircle, Send,
    Hash, ChevronDown, ChevronRight, BookOpen
} from 'lucide-react';
import {
    getRooms, getRoomMessages, sendRoomMessage,
    getSkillHistory, Room, RoomMessage, ProfileItem
} from '../../api/db';
import { useUser } from '../context/UserContext';
import { format } from 'date-fns';

interface CommunitiesProps {
    onBack: () => void;
}

export const Communities: React.FC<CommunitiesProps> = ({ onBack }) => {
    const { user } = useUser();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<RoomMessage[]>([]);
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [sending, setSending] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const messageEndRef = useRef<HTMLDivElement>(null);

    // Load rooms and user skills on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allRooms, history] = await Promise.all([
                    getRooms(),
                    user?.id ? getSkillHistory(user.id) : Promise.resolve([] as ProfileItem[])
                ]);

                setRooms(allRooms);
                const uniqueSkills = Array.from(new Set(history.flatMap(h => h.skills || [])));
                setUserSkills(uniqueSkills);

                // Auto-select first room or first room that matches user skill
                const defaultRoom = allRooms.find(r => uniqueSkills.includes(r.skill)) || allRooms[0];
                if (defaultRoom) setSelectedRoom(defaultRoom);

                // Initial categories expansion
                const cats = Array.from(new Set(allRooms.map(r => r.category)));
                const initialExpanded: Record<string, boolean> = {};
                cats.forEach(c => initialExpanded[c] = true);
                setExpandedCategories(initialExpanded);
            } catch (error) {
                console.error('Failed to fetch communities data:', error);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchData();
    }, [user?.id]);

    // Poll for messages when a room is selected
    useEffect(() => {
        if (!selectedRoom) return;

        const fetchMessages = async () => {
            try {
                const history = await getRoomMessages(selectedRoom.id);
                setMessages(history);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [selectedRoom?.id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom || !user || !newMessage.trim() || sending) return;

        setSending(true);
        try {
            const username = `${user.first_name} ${user.last_name}`;
            await sendRoomMessage(selectedRoom.id, user.id, username, newMessage.trim());
            setNewMessage('');
            // Refresh messages immediately
            const history = await getRoomMessages(selectedRoom.id);
            setMessages(history);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    // Group rooms by category
    const groupedRooms = rooms.reduce((acc, room) => {
        if (!acc[room.category]) acc[room.category] = [];
        acc[room.category].push(room);
        return acc;
    }, {} as Record<string, Room[]>);

    if (loadingRooms) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-gray-950">
            {/* Rooms Sidebar (Discord style) */}
            <div className="w-64 bg-gray-100 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shrink-0">
                    <button onClick={onBack} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <h1 className="font-bold text-gray-900 dark:text-gray-100 truncate">Communities</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    {Object.entries(groupedRooms).map(([category, catRooms]) => (
                        <div key={category} className="space-y-1">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                {expandedCategories[category] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                {category}
                            </button>

                            {expandedCategories[category] && catRooms.map(room => {
                                const isUserSkill = userSkills.includes(room.skill);
                                const isSelected = selectedRoom?.id === room.id;

                                return (
                                    <button
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group ${isSelected
                                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                            : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Hash className={`w-4 h-4 ${isSelected ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                        <span className="truncate flex-1 text-left">{room.skill}</span>
                                        {isUserSkill && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Your skill" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* User bar */}
                <div className="p-3 bg-gray-200/50 dark:bg-gray-800/50 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[10px] text-gray-500 truncate">Online</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedRoom ? (
                    <>
                        {/* Room Header */}
                        <div className="h-12 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <Hash className="w-5 h-5 text-gray-400" />
                                <h2 className="font-bold text-gray-900 dark:text-gray-100 truncate">{selectedRoom.skill}</h2>
                                <div className="w-px h-4 bg-gray-200 dark:border-gray-800 mx-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedRoom.description}</p>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <Users className="w-5 h-5" />
                                <Search className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="pb-8">
                                <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                    <Hash className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome to #{selectedRoom.skill}!</h3>
                                <p className="text-gray-500 dark:text-gray-400">This is the start of the #{selectedRoom.skill} community.</p>
                                <div className="h-px bg-gray-200 dark:bg-gray-800 mt-6" />
                            </div>

                            {messages.map((msg, i) => {
                                const prevMsg = messages[i - 1];
                                const isCompact = prevMsg && prevMsg.user_id === msg.user_id &&
                                    (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 300000); // 5 mins

                                if (isCompact) {
                                    return (
                                        <div key={msg.id} className="pl-14 group">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed -mt-1 group-hover:bg-gray-50 dark:group-hover:bg-gray-900/30">
                                                {msg.content}
                                            </p>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} className="flex gap-4 group hover:bg-gray-50 dark:hover:bg-gray-900/30 -mx-4 px-4 py-1">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1">
                                            {msg.username?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm hover:underline cursor-pointer">
                                                    {msg.username}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {format(new Date(msg.created_at), 'MM/dd/yyyy h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        {/* Input Bar */}
                        <div className="p-4 shrink-0">
                            <form
                                onSubmit={handleSendMessage}
                                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder={`Message #${selectedRoom.skill}`}
                                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-1.5 px-2 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="p-1.5 text-gray-500 hover:text-blue-500 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6">
                            <Users className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select a Community</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">Join a skill-based room to connect with other learners, share resources, and grow together.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
