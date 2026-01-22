import React, { useState, useEffect, useRef } from 'react';
import { Server, Channel, User, Message } from './types';
import ServerSidebar from './components/ServerSidebar';
import ChannelSidebar from './components/ChannelSidebar';
import ChatArea from './components/ChatArea';
import UserSidebar from './components/UserSidebar';
import AuthScreen from './components/AuthScreen';
import { io, Socket } from 'socket.io-client';

// URL вашего бэкенда на Render. 
// Если имя сервиса другое, поменяйте 'discordec' на нужное.
const BACKEND_URL = "https://discordec.onrender.com";

// Initial Data Structure
const INITIAL_SERVER_DATA: Server[] = [
  {
    id: 's1',
    name: '$mendeleevo$',
    icon: 'https://picsum.photos/100',
    members: [], 
    categories: [
      {
        id: 'c1',
        name: 'Information',
        channels: [
          { id: 'rules', name: 'rules', type: 'text' },
          { id: 'announcements', name: 'announcements', type: 'announcement' }
        ]
      },
      {
        id: 'c2',
        name: 'Text Channels',
        channels: [
          { id: 'general', name: 'general', type: 'text' },
          { id: 'chat', name: 'chat', type: 'text' },
          { id: 'memes', name: 'memes', type: 'text' },
        ]
      },
      {
        id: 'c3',
        name: 'Voice Channels',
        channels: [
          { id: 'v1', name: 'General', type: 'voice' },
          { id: 'v2', name: 'Gaming', type: 'voice' }
        ]
      }
    ]
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeServerId, setActiveServerId] = useState<string>(INITIAL_SERVER_DATA[0].id);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [serverData, setServerData] = useState(INITIAL_SERVER_DATA);
  const [isConnected, setIsConnected] = useState(false);
  
  // Message Storage (Local + Network)
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    // Try to load cached messages to show something while connecting
    const saved = localStorage.getItem('mendeleevo_messages');
    return saved ? JSON.parse(saved) : {
        'general': [
             { 
                id: 'welcome-msg', 
                content: 'Welcome to the $mendeleevo$ Global Server! Connecting to network...', 
                author: { id: 'sys', username: 'System', status: 'online' } as User, 
                timestamp: new Date().toISOString(),
                type: 'text'
            }
        ]
    };
  });

  const socketRef = useRef<Socket | null>(null);

  // Load Session
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('mendeleevo_session');
    if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  // Socket.io Connection Logic
  useEffect(() => {
    // Only connect if user is logged in
    if (!currentUser) return;

    // Initialize Socket
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("Connected to Backend:", socket.id);
      setIsConnected(true);
      // Announce presence
      socket.emit('join_server', currentUser);
    });

    socket.on('disconnect', () => {
      console.log("Disconnected from Backend");
      setIsConnected(false);
    });

    // Receive Message from Server (Real-time!)
    socket.on('receive_message', (data: Message & { channelId: string }) => {
        setMessages(prev => {
            const channelMsgs = prev[data.channelId] || [];
            // Avoid duplicates if any
            if (channelMsgs.some(m => m.id === data.id)) return prev;

            const newMessages = {
                ...prev,
                [data.channelId]: [...channelMsgs, data]
            };
            // Cache to local storage
            localStorage.setItem('mendeleevo_messages', JSON.stringify(newMessages));
            return newMessages;
        });
    });

    // Receive Active Users Update
    socket.on('update_users', (users: User[]) => {
        setServerData(prev => prev.map(s => {
            // Update members list for the main server
            if (s.id === 's1') {
                // Merge real online users with fake offline/bot users if you want, 
                // or just strictly use server list. Let's strict use server list + current user
                // To keep it simple, we just replace the members list
                return { ...s, members: users };
            }
            return s;
        }));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]); // Re-connect if user changes (re-login)

  const activeServer = serverData.find(s => s.id === activeServerId) || serverData[0];
  const allChannels = activeServer.categories.flatMap(c => c.channels);
  const activeChannel = allChannels.find(c => c.id === activeChannelId) || allChannels[0];

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('mendeleevo_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('mendeleevo_session');
    if (socketRef.current) socketRef.current.disconnect();
  };

  const handleSendMessage = (content: string, type: 'text' | 'audio') => {
    if (!currentUser || !socketRef.current) return;

    const messageData = {
        id: Date.now().toString() + Math.random().toString().slice(2, 5), // Generate ID client-side or let server do it
        channelId: activeChannelId,
        content,
        type,
        author: currentUser,
        timestamp: new Date().toISOString()
    };

    // Emit to server. Server will broadcast back 'receive_message'
    socketRef.current.emit('send_message', messageData);
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#313338]">
      <ServerSidebar 
        servers={serverData} 
        activeServerId={activeServerId} 
        onServerClick={setActiveServerId} 
      />
      
      <ChannelSidebar 
        server={activeServer} 
        activeChannelId={activeChannelId} 
        currentUser={currentUser} 
        onChannelClick={(id) => setActiveChannelId(id)}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Connection Status Bar (if disconnected) */}
        {!isConnected && (
            <div className="bg-yellow-600 text-white text-xs px-2 py-1 text-center font-bold">
                Connecting to server... (This may take up to 1 min if server is sleeping)
            </div>
        )}

        <ChatArea 
            channel={activeChannel} 
            messages={messages[activeChannelId] || []} 
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
        />
      </div>
      
      <UserSidebar members={activeServer.members} />
    </div>
  );
};

export default App;