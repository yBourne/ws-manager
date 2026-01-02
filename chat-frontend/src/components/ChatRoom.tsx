'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { Send, User, Users, LogOut, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types/chat';

interface ChatRoomProps {
    roomId: string;
    username: string;
    messages: ChatMessage[];
    users: string[];
    onSendMessage: (content: string) => void;
    onLeaveRoom: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
    roomId,
    username,
    messages,
    users,
    onSendMessage,
    onLeaveRoom,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showUsers, setShowUsers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-h-[95svh] md:h-[600px] w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-indigo-500 rounded-lg text-white">
                        <MessageSquare size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">Room: {roomId}</h2>
                        <button
                            onClick={() => setShowUsers(!showUsers)}
                            className="flex items-center gap-1.5 text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400 font-medium md:pointer-events-none"
                        >
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span>{users.length} online</span>
                            <span className="md:hidden underline">View list</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onLeaveRoom}
                        className="flex items-center gap-2 px-2 md:px-3 py-1.5 text-xs md:text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Leave Room</span>
                        <span className="sm:hidden">Exit</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* User List Sidebar (Desktop and Mobile Overlay) */}
                <div className={`
                    ${showUsers ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    absolute md:relative z-20 w-64 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 md:bg-zinc-50/50 md:dark:bg-zinc-900/50 backdrop-blur-md md:backdrop-blur-none transition-transform duration-300 md:block
                `}>
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Users size={14} />
                                Active Users
                            </div>
                            <button onClick={() => setShowUsers(false)} className="md:hidden p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                Close
                            </button>
                        </div>
                        <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
                            {users.map((user, idx) => (
                                <li key={idx} className={`flex items-center gap-2 p-2 rounded-xl border ${user === username ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'} shadow-sm`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user === username ? 'bg-indigo-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate">
                                        {user} {user === username && '(Me)'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Overlay for mobile user list */}
                {showUsers && (
                    <div
                        className="absolute inset-0 z-10 bg-zinc-950/20 backdrop-blur-[2px] md:hidden"
                        onClick={() => setShowUsers(false)}
                    />
                )}

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-zinc-950">
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col gap-4">
                        <div className="mt-auto" />
                        {messages.map((msg, idx) => {
                            const isOwn = msg.sender === username;
                            const isSystem = msg.type === 'JOIN' || msg.type === 'LEAVE';

                            if (isSystem) {
                                return (
                                    <div key={idx} className="flex justify-center my-2">
                                        <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter text-center">
                                            {msg.content}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] md:max-w-[75%] group`}>
                                        <div className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">{msg.sender}</span>
                                            <span className="text-[10px] text-zinc-400">
                                                {(() => {
                                                    if (!msg.timestamp) return '';
                                                    const date = new Date(msg.timestamp);
                                                    return isToday(date)
                                                        ? format(date, 'HH:mm')
                                                        : format(date, 'MMM d, HH:mm');
                                                })()}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] md:text-sm whitespace-pre-wrap break-words ${isOwn
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tl-none font-medium'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input part */}
                    <div className="p-3 md:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (inputValue.trim()) {
                                            handleSend(e);
                                        }
                                    }
                                }}
                                placeholder="Message..."
                                rows={1}
                                className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[16px] md:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 resize-none min-h-[46px]"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center min-w-[46px] h-[46px] active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
