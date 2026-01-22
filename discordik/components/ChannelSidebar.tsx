import React from 'react';
import { Server, Channel, User } from '../types';
import { ChevronDown, Hash, Volume2, Mic, Headphones, Settings, UserPlus, PhoneOff, Signal } from 'lucide-react';

interface ChannelSidebarProps {
  server: Server;
  activeChannelId: string;
  currentUser: User;
  onChannelClick: (id: string, type: 'text' | 'voice' | 'announcement') => void;
  onLogout: () => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({ 
  server, 
  activeChannelId, 
  currentUser, 
  onChannelClick,
  onLogout
}) => {
  return (
    <div className="flex flex-col w-60 bg-[#2B2D31] h-full shrink-0">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between shadow-sm hover:bg-[#35373C] cursor-pointer transition-colors border-b border-[#1f2023]">
        <h1 className="font-bold text-white truncate text-[15px]">{server.name}</h1>
        <ChevronDown size={20} className="text-white" />
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
        {server.categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div className="flex items-center justify-between px-0.5 mb-1 text-[#949BA4] hover:text-[#dbdee1] cursor-pointer uppercase text-[12px] font-bold">
              <div className="flex items-center">
                <ChevronDown size={12} className="mr-0.5" />
                <span>{category.name}</span>
              </div>
              <PlusButton />
            </div>
            
            <div className="space-y-[1px]">
              {category.channels.map((channel) => {
                const isVoice = channel.type === 'voice';
                const isSelected = activeChannelId === channel.id;
                
                return (
                  <div key={channel.id}>
                    <button
                      onClick={() => onChannelClick(channel.id, channel.type)}
                      className={`group w-full flex items-center px-2 py-[5px] rounded mx-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#404249] text-white'
                          : 'text-[#949BA4] hover:bg-[#35373C] hover:text-[#dbdee1]'
                      }`}
                    >
                      {isVoice ? (
                        <Volume2 size={20} className="mr-1.5 text-[#80848E]" />
                      ) : (
                        <Hash size={20} className="mr-1.5 text-[#80848E]" />
                      )}
                      <span className={`truncate font-medium ${isSelected ? 'text-white' : ''}`}>
                        {channel.name}
                      </span>
                      {isVoice && (
                         <div className="ml-auto flex items-center">
                             <div className="opacity-0 group-hover:opacity-100">
                                <UserPlus size={14} className="text-[#B5BAC1]" />
                             </div>
                         </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Controls */}
      <div className="bg-[#232428] px-2 py-1.5 flex items-center">
        <div className="group flex items-center p-1 rounded-md hover:bg-[#3F4147] cursor-pointer mr-auto min-w-0">
          <div className="relative mr-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-500">
               <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} alt="User" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#232428] rounded-full"></div>
          </div>
          <div className="truncate">
            <div className="text-white text-sm font-semibold truncate">{currentUser.username}</div>
            <div className="text-[#B5BAC1] text-xs truncate">#{currentUser.id.substring(0,4)}</div>
          </div>
        </div>
        
        <div className="flex items-center">
            <button onClick={onLogout} title="Log Out" className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#3F4147] text-[#dbdee1] transition-colors">
                 <Settings size={18} />
            </button>
            <ControlIcon icon={<Mic size={18} />} />
            <ControlIcon icon={<Headphones size={18} />} />
        </div>
      </div>
    </div>
  );
};

const PlusButton = () => (
    <button className="text-[#949BA4] hover:text-white">
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/>
        </svg>
    </button>
)

const ControlIcon = ({ icon }: { icon: React.ReactNode }) => (
  <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#3F4147] text-[#dbdee1] transition-colors">
    {icon}
  </button>
);

export default ChannelSidebar;
