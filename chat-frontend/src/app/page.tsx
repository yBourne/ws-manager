'use client';

import React, { useState } from 'react';
import ChatRoom from '@/components/ChatRoom';
import { useChat } from '@/hooks/useChat';
import { Wifi, WifiOff, PlusCircle, LogIn, User as UserIcon, Lock, Hash, Coffee } from 'lucide-react';

export default function Home() {
  const {
    connected,
    connect,
    messages,
    users,
    error,
    createRoom,
    joinRoom,
    sendMessage,
    leaveRoom,
    currentRoomId
  } = useChat();

  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'public' | 'join' | 'create'>('public');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    connect();
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    if (mode === 'public') {
      joinRoom('Public Lounge', '', username);
    } else if (mode === 'create') {
      if (!roomId || !password) return;
      createRoom(roomId, password, username);
    } else {
      if (!roomId || !password) return;
      joinRoom(roomId, password, username);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 md:p-8">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {!connected ? (
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">
                Nexus Chat
              </h1>
              <p className="text-zinc-400 text-lg">Real-time connection, synchronized across all devices.</p>
            </div>

            <div className="p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-zinc-700">
                <WifiOff className="text-zinc-500" size={32} />
              </div>
              <button
                onClick={handleConnect}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
              >
                Establish Connection
              </button>
              <p className="mt-4 text-xs text-zinc-500">Connecting to {mounted ? window.location.hostname : '...'}</p>
            </div>
          </div>
        ) : !currentRoomId ? (
          <div className="max-w-md w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-500 uppercase tracking-widest">System Online</span>
              </div>
              <div className="px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700 text-xs text-zinc-400 flex items-center gap-2">
                <Wifi size={12} />
                Connected
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8">
              <div className="flex p-1 bg-zinc-800 rounded-xl mb-8">
                <button
                  type="button"
                  onClick={() => setMode('public')}
                  className={`flex-1 py-2 text-[10px] md:text-sm font-semibold rounded-lg transition-all ${mode === 'public' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setMode('join')}
                  className={`flex-1 py-2 text-[10px] md:text-sm font-semibold rounded-lg transition-all ${mode === 'join' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className={`flex-1 py-2 text-[10px] md:text-sm font-semibold rounded-lg transition-all ${mode === 'create' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Create
                </button>
              </div>

              <form onSubmit={handleAction} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">Your Identity</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter nickname"
                      className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-zinc-600"
                      required
                    />
                  </div>
                </div>

                {mode !== 'public' && (
                  <>
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">Room Key</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                          type="text"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          placeholder="Room ID"
                          className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-zinc-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-400">
                      <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">Security Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-white placeholder:text-zinc-600"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                >
                  {mode === 'public' ? <Coffee size={20} /> : mode === 'create' ? <PlusCircle size={20} /> : <LogIn size={20} />}
                  <span>{mode === 'public' ? 'Join Lounge' : mode === 'create' ? 'Initialize Room' : 'Enter Room'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
            <ChatRoom
              roomId={currentRoomId}
              username={username}
              messages={messages}
              users={users}
              onSendMessage={(content) => sendMessage(content, username, currentRoomId)}
              onLeaveRoom={leaveRoom}
            />
          </div>
        )}
      </div>
    </main>
  );
}
