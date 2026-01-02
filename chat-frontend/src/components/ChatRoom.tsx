'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-h-[90svh] md:h-[600px] w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm md:text-lg font-bold text-zinc-900 dark:text-zinc-100">Room: {roomId}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span>{users.length} members</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onLeaveRoom}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Leave Room</span>
                    <span className="sm:hidden">Leave</span>
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* User List Sidebar */}
                <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                            <Users size={14} />
                            Active Users
                        </div>
                        <ul className="space-y-2">
                            {users.map((user, idx) => (
                                <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                                        {user} {user === username && '(You)'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-zinc-950">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => {
                            const isOwn = msg.sender === username;
                            const isSystem = msg.type === 'JOIN' || msg.type === 'LEAVE';

                            if (isSystem) {
                                return (
                                    <div key={idx} className="flex justify-center">
                                        <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter text-center">
                                            {msg.content}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] group`}>
                                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{msg.sender}</span>
                                            <span className="text-[10px] text-zinc-400">
                                                {(() => {
                                                    try {
                                                        return msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : '';
                                                    } catch (e) {
                                                        return '';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${isOwn
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 md:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-base md:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="p-2 md:p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center min-w-[44px]"
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
