import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Simulate Backend using LocalStorage
    const storedUsersString = localStorage.getItem('mendeleevo_users');
    const storedUsers = storedUsersString ? JSON.parse(storedUsersString) : {};

    if (isRegistering) {
      if (storedUsers[username]) {
        setError('Username already taken');
        return;
      }
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username: username,
        status: 'online',
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        password: password // In a real app, never store plain text passwords!
      };
      
      storedUsers[username] = newUser;
      localStorage.setItem('mendeleevo_users', JSON.stringify(storedUsers));
      
      onLogin(newUser);
    } else {
      // Login
      const userRecord = storedUsers[username];
      if (userRecord && userRecord.password === password) {
        onLogin(userRecord);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('https://cdn.discordapp.com/attachments/896677328905359360/1169006579930058802/bg.png')] bg-cover bg-center font-sans">
      <div className="bg-[#313338] p-8 rounded-md shadow-2xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to $mendeleevo$</h1>
          <p className="text-[#B5BAC1]">{isRegistering ? "Create an account" : "We're so excited to see you again!"}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#B5BAC1] text-xs font-bold uppercase mb-2">
              Username {error && <span className="text-red-400 italic normal-case ml-1">- {error}</span>}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none focus:outline-none focus:ring-0"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-[#B5BAC1] text-xs font-bold uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1E1F22] text-white p-2.5 rounded border-none focus:outline-none focus:ring-0"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2.5 rounded transition-colors mb-2"
          >
            {isRegistering ? 'Register' : 'Log In'}
          </button>
        </form>

        <div className="text-sm text-[#949BA4] mt-2">
          {isRegistering ? 'Already have an account? ' : 'Need an account? '}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[#00A8FC] hover:underline"
          >
            {isRegistering ? 'Log In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
