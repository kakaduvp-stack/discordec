import React, { useState, useEffect, useRef } from 'react';
import { Channel, Message, User } from '../types';
import { Hash, Bell, Pin, Users, Inbox, HelpCircle, PlusCircle, Gift, Sticker, Smile, Mic, Send, Trash2, Play, Pause } from 'lucide-react';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type: 'text' | 'audio') => void;
}

// Custom Component for Beautiful Voice Messages
const VoiceMessagePlayer: React.FC<{ src: string }> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const resetPlayState = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    const setAudioDuration = () => {
      if(isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', resetPlayState);
    audio.addEventListener('loadedmetadata', setAudioDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', resetPlayState);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center bg-[#F2F3F5] dark:bg-[#383A40] rounded flex-row p-2 pr-4 mt-1 max-w-[320px] min-w-[200px] gap-3 border border-transparent hover:border-[#5865F2] transition-colors">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors shrink-0"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </button>

      <div className="flex flex-col flex-1 gap-1 min-w-[120px]">
        {/* Fake Waveform Visualizer */}
        <div className="h-6 flex items-center gap-[3px] opacity-90 overflow-hidden" onClick={(e) => {
            // Simple seek functionality simulation
            const bounds = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - bounds.left) / bounds.width;
            if (audioRef.current && isFinite(audioRef.current.duration)) {
                audioRef.current.currentTime = percent * audioRef.current.duration;
            }
        }}>
          {[...Array(20)].map((_, i) => {
             // Generate "random" heights based on index to simulate voice
             const height = 30 + (Math.sin(i * 10) * 20) + (Math.random() * 40); 
             const barProgress = (i / 20) * 100;
             const isPlayed = barProgress < progress;
             return (
               <div 
                 key={i} 
                 className={`w-1.5 rounded-full transition-colors duration-150 ${isPlayed ? 'bg-[#5865F2]' : 'bg-[#4E5058]'}`}
                 style={{ height: `${Math.min(100, height)}%` }}
               />
             )
          })}
        </div>
        <div className="flex justify-between w-full">
             <span className="text-[10px] text-[#5865F2] font-bold font-mono">
                {isPlaying && audioRef.current ? formatDuration(audioRef.current.currentTime) : "0:00"}
             </span>
             <span className="text-[10px] text-[#949BA4] font-medium font-mono">
                {formatDuration(duration)}
             </span>
        </div>
      </div>
    </div>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ channel, messages, currentUser, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    audioChunksRef.current = [];
    setRecordingTime(0);
  };

  const sendVoiceMessage = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        setTimeout(processAudio, 200);
    } else {
        processAudio();
    }
  };

  const processAudio = () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
        const base64Audio = reader.result as string;
        onSendMessage(base64Audio, 'audio');
        setIsRecording(false);
        setRecordingTime(0);
        audioChunksRef.current = [];
        if (timerRef.current) clearInterval(timerRef.current);
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Input Handlers ---

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue, 'text');
        setInputValue('');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // --- Render ---

  if (channel.type === 'voice') {
    return (
      <div className="flex flex-col flex-1 min-w-0 bg-[#313338] items-center justify-center text-white">
        <div className="bg-[#2B2D31] p-8 rounded-xl flex flex-col items-center shadow-lg">
             <div className="w-16 h-16 bg-[#5865F2] rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Mic size={32} className="text-white" />
             </div>
            <h2 className="text-xl font-bold mb-2">Voice Channel: {channel.name}</h2>
            <p className="text-gray-400 text-center max-w-md">
                Voice streaming requires a WebSocket backend server. <br/> 
                Currently simulated in browser mode.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#313338]">
      {/* Header */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-[#26272D] shadow-sm shrink-0">
        <div className="flex items-center text-white overflow-hidden">
          <Hash size={24} className="text-[#80848E] mr-2 shrink-0" />
          <h3 className="font-bold text-md truncate">{channel.name}</h3>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4 text-[#B5BAC1]">
           <Bell size={24} className="hover:text-[#dbdee1] cursor-pointer hidden sm:block" />
           <Pin size={24} className="hover:text-[#dbdee1] cursor-pointer hidden sm:block" />
           <Users size={24} className="hover:text-[#dbdee1] cursor-pointer block md:hidden" />
           <Inbox size={24} className="hover:text-[#dbdee1] cursor-pointer hidden sm:block" />
           <HelpCircle size={24} className="hover:text-[#dbdee1] cursor-pointer hidden sm:block" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-4">
         <div className="mt-4 mb-8">
            <div className="w-16 h-16 bg-[#41434A] rounded-full flex items-center justify-center mb-4">
                <Hash size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{channel.name}!</h1>
            <p className="text-[#B5BAC1]">This is the start of the #{channel.name} channel.</p>
         </div>

         {messages.map((msg, index) => {
           const prevMsg = messages[index - 1];
           const msgDate = new Date(msg.timestamp);
           const prevMsgDate = prevMsg ? new Date(prevMsg.timestamp) : new Date(0);
           const isSequence = prevMsg && prevMsg.author.id === msg.author.id && (msgDate.getTime() - prevMsgDate.getTime() < 5 * 60 * 1000);
           
           return (
             <div key={msg.id} className={`group flex pr-4 ${isSequence ? 'mt-0.5 py-0.5 hover:bg-[#2e3035]' : 'mt-4 hover:bg-[#2e3035] -ml-4 pl-4 py-0.5'}`}>
               {!isSequence ? (
                 <div className="mt-0.5 mr-4 shrink-0 cursor-pointer">
                   <img 
                      src={msg.author.avatar || `https://ui-avatars.com/api/?name=${msg.author.username}&background=random`} 
                      className="w-10 h-10 rounded-full hover:shadow-lg transition-shadow" 
                      alt={msg.author.username} 
                   />
                 </div>
               ) : (
                  <div className="w-10 mr-4 shrink-0 text-[10px] text-[#949BA4] opacity-0 group-hover:opacity-100 flex items-center justify-center select-none">
                      {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
               )}

               <div className="flex-1 min-w-0">
                 {!isSequence && (
                   <div className="flex items-center mb-1">
                     <span 
                        className="font-medium text-white mr-2 hover:underline cursor-pointer" 
                        style={{ color: msg.author.color }}
                     >
                        {msg.author.username}
                     </span>
                     <span className="text-xs text-[#949BA4] ml-1">{formatDate(msg.timestamp)}</span>
                   </div>
                 )}
                 
                 {msg.type === 'audio' ? (
                     <VoiceMessagePlayer src={msg.content} />
                 ) : (
                     <p className={`text-[#DBDEE1] whitespace-pre-wrap leading-6`}>
                        {msg.content}
                     </p>
                 )}
               </div>
             </div>
           );
         })}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 shrink-0 z-10 bg-[#313338]">
        <div className="bg-[#383A40] rounded-lg px-4 py-2.5 flex items-center relative">
          
          <div className="flex items-center space-x-3 mr-4 sticky top-0">
             <PlusCircle size={24} className="text-[#B5BAC1] hover:text-[#dbdee1] cursor-pointer" />
          </div>
          
          {isRecording ? (
             <div className="flex-1 flex items-center justify-between text-red-500 animate-pulse bg-[#383A40]">
                 <div className="flex items-center">
                    <Mic size={20} className="mr-2" />
                    <span className="font-bold">Recording... {formatTime(recordingTime)}</span>
                 </div>
                 <div className="flex items-center space-x-2">
                     <button onClick={cancelRecording} className="text-[#B5BAC1] hover:text-white p-1">
                        <Trash2 size={20} />
                     </button>
                     <button onClick={sendVoiceMessage} className="text-[#5865F2] hover:text-white p-1">
                        <Send size={20} />
                     </button>
                 </div>
             </div>
          ) : (
              <>
                <input
                    type="text"
                    className="bg-transparent flex-1 text-[#DBDEE1] placeholder-[#949BA4] focus:outline-none"
                    placeholder={`Message #${channel.name}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex items-center space-x-3 ml-4">
                    <button 
                        onClick={startRecording}
                        className="text-[#B5BAC1] hover:text-red-500 transition-colors"
                        title="Record Voice Message"
                    >
                        <Mic size={24} />
                    </button>
                    <Gift size={24} className="text-[#B5BAC1] hover:text-[#dbdee1] cursor-pointer" />
                    <Sticker size={24} className="text-[#B5BAC1] hover:text-[#dbdee1] cursor-pointer" />
                    <Smile size={24} className="text-[#B5BAC1] hover:text-[#dbdee1] cursor-pointer" />
                </div>
              </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;