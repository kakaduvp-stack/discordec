import React from 'react';
import { Server } from '../types';
import { Plus, Compass, Download } from 'lucide-react';

interface ServerSidebarProps {
  servers: Server[];
  activeServerId: string;
  onServerClick: (id: string) => void;
}

const ServerSidebar: React.FC<ServerSidebarProps> = ({ servers, activeServerId, onServerClick }) => {
  return (
    <nav className="flex flex-col items-center w-[72px] bg-[#1E1F22] py-3 space-y-2 overflow-y-auto h-full shrink-0">
      {/* Home / DM Icon */}
      <button className="group relative flex items-center justify-center w-12 h-12 bg-[#313338] hover:bg-[#5865F2] rounded-[24px] hover:rounded-[16px] transition-all duration-200 mb-2">
        <svg width="30" height="30" viewBox="0 0 24 24" className="text-white">
          <path fill="currentColor" d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.6 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.48 1.7 11.06 0 .14.13.29.26.46.37-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.6-2.87.47-4.5-1.67-12.82-1.67-12.82ZM8.5 14.38c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Z"/>
        </svg>
        <div className="absolute left-0 w-1 h-0 bg-white rounded-r-full transition-all duration-200 opacity-0 group-hover:h-5 top-1/2 -translate-y-1/2 -ml-4"></div>
      </button>

      <div className="w-8 h-[2px] bg-[#35363C] rounded-lg mx-auto"></div>

      {servers.map((server) => (
        <div key={server.id} className="relative group w-full flex justify-center">
          {activeServerId === server.id && (
            <div className="absolute left-0 w-1 h-10 bg-white rounded-r-full top-1/2 -translate-y-1/2"></div>
          )}
          {activeServerId !== server.id && (
             <div className="absolute left-0 w-1 h-2 bg-white rounded-r-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:h-5 transition-all duration-200"></div>
          )}
          
          <button
            onClick={() => onServerClick(server.id)}
            className={`w-12 h-12 flex items-center justify-center rounded-[24px] transition-all duration-200 overflow-hidden ${
              activeServerId === server.id
                ? 'bg-[#5865F2] rounded-[16px] text-white'
                : 'bg-[#313338] text-gray-400 group-hover:bg-[#5865F2] group-hover:text-white group-hover:rounded-[16px]'
            }`}
          >
            {server.icon ? (
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-semibold text-sm">{server.name.substring(0, 2).toUpperCase()}</span>
            )}
          </button>
        </div>
      ))}

      <div className="w-12 h-12 flex items-center justify-center bg-[#313338] hover:bg-[#23a559] text-[#23a559] hover:text-white rounded-[24px] hover:rounded-[16px] transition-all duration-200 cursor-pointer">
        <Plus size={24} />
      </div>
      
      <div className="w-12 h-12 flex items-center justify-center bg-[#313338] hover:bg-[#23a559] text-[#23a559] hover:text-white rounded-[24px] hover:rounded-[16px] transition-all duration-200 cursor-pointer">
        <Compass size={24} />
      </div>
    </nav>
  );
};

export default ServerSidebar;