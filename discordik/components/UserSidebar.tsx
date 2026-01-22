import React from 'react';
import { User } from '../types';

interface UserSidebarProps {
  members: User[];
}

const UserSidebar: React.FC<UserSidebarProps> = ({ members }) => {
  // Group members by status or role
  const onlineMembers = members.filter(m => m.status !== 'offline');
  const offlineMembers = members.filter(m => m.status === 'offline');

  return (
    <div className="hidden md:flex flex-col w-60 bg-[#2B2D31] h-full shrink-0 overflow-y-auto px-4 py-6 custom-scrollbar">
      
      {/* Online Category */}
      <div className="mb-6">
        <h3 className="text-[#949BA4] font-bold text-xs uppercase mb-2 px-2">Online — {onlineMembers.length}</h3>
        <div className="space-y-0.5">
            {onlineMembers.map(member => (
                <UserItem key={member.id} user={member} />
            ))}
        </div>
      </div>

      {/* Offline Category */}
      <div>
        <h3 className="text-[#949BA4] font-bold text-xs uppercase mb-2 px-2">Offline — {offlineMembers.length}</h3>
        <div className="space-y-0.5">
            {offlineMembers.map(member => (
                <UserItem key={member.id} user={member} />
            ))}
        </div>
      </div>
    </div>
  );
};

const UserItem = ({ user }: { user: User }) => {
    return (
        <div className="flex items-center px-2 py-1.5 rounded hover:bg-[#35373C] cursor-pointer group opacity-90 hover:opacity-100">
            <div className="relative mr-3">
                <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                    alt={user.username} 
                    className={`w-8 h-8 rounded-full ${user.status === 'offline' ? 'opacity-50' : ''}`}
                />
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-[#2B2D31] rounded-full
                    ${user.status === 'online' ? 'bg-green-500' : ''}
                    ${user.status === 'idle' ? 'bg-yellow-500' : ''}
                    ${user.status === 'dnd' ? 'bg-red-500' : ''}
                    ${user.status === 'offline' ? 'hidden' : ''}
                `}></div>
            </div>
            <div className="flex flex-col min-w-0">
                <div className="flex items-center">
                    <span className={`font-medium truncate ${user.status === 'offline' ? 'text-[#949BA4]' : 'text-[#DBDEE1]'}`} style={{ color: user.color }}>
                        {user.username}
                    </span>
                    {user.isBot && (
                        <span className="ml-1.5 bg-[#5865F2] text-white text-[10px] px-1.5 rounded-[3px] py-[1px] flex items-center h-4 leading-none">
                            BOT
                        </span>
                    )}
                </div>
                <div className="text-xs text-[#949BA4] truncate">
                   {user.isBot ? 'AI Assistant' : user.status === 'dnd' ? 'Do Not Disturb' : ''}
                </div>
            </div>
        </div>
    )
}

export default UserSidebar;