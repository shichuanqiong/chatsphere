import React, { useState } from 'react';
import type { User, UserProfile } from '../types';
import { login, register } from '../services/authService';
import RotatingBackground from './RotatingBackground';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  onGuestLogin: (profile: UserProfile) => void;
}

type AuthMode = 'login' | 'register' | 'guest';

// Generate gender-specific avatar
const generateGenderSpecificAvatar = (nickname: string, gender: string): string => {
  // Create a more specific seed that includes gender information
  const genderCode = gender === 'Male' ? 'm' : gender === 'Female' ? 'f' : 'n';
  const seed = `${nickname}-${genderCode}-${Date.now()}`;
  
  // Use pravatar.cc with gender-specific seed
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onGuestLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [country, setCountry] = useState('USA');
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const clearForm = () => {
      setNickname('');
      setPassword('');
      setEmail('');
      setAge('');
      setGender('Male');
      setCountry('USA');
      setError('');
  }

  const handleSetMode = (mode: AuthMode) => {
    setAuthMode(mode);
    clearForm();
  };

  const validateEmail = (email: string) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!nickname || !password) {
          setError('Nickname and password are required.');
          return;
      }
      const result = login(nickname, password);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setError(result.message);
      }
    } else if (authMode === 'register') {
      if (!nickname.trim() || !password || !email.trim() || !age) {
        setError('All fields are required.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (parseInt(age, 10) < 18) {
        setError('You must be at least 18 years old.');
        return;
      }
      const genderSpecificAvatar = generateGenderSpecificAvatar(nickname, gender);
      const userData: Omit<User, 'id'> = { 
        nickname, 
        password, 
        email, 
        age: parseInt(age, 10), 
        gender, 
        country, 
        avatar: genderSpecificAvatar, 
        bio: '' 
      };
      const result = register(userData);
       if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setError(result.message);
      }
    } else { // Guest mode
        if (!nickname || !age) {
            setError('Nickname and age are required.');
            return;
        }
        
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 13) {
            setError('You must be at least 13 years old to chat as a guest.');
            return;
        }
        
        // Generate gender-appropriate avatar
        const avatarSeed = `${nickname.trim()}-${gender}-${Date.now()}`;
        const guestProfile = {
            nickname: nickname.trim(),
            age: ageNum,
            gender,
            country,
            avatar: generateGenderSpecificAvatar(nickname.trim(), gender),
            bio: ''
        };
        
        onGuestLogin(guestProfile);
    }
  };
  
  const getTitle = () => {
      switch(authMode) {
          case 'login': return 'Sign in to your account';
          case 'register': return 'Create a new account';
          case 'guest': return 'Chat as a Guest';
      }
  }
  
  const getButtonText = () => {
      switch(authMode) {
          case 'login': return 'Login';
          case 'register': return 'Create Account';
          case 'guest': return 'Start Chatting';
      }
  }

  const TermsModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(56, 178, 172, 0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(139, 92, 246, 0.12) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 178, 172, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 178, 172, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Terms & Privacy Policy</h2>
            <button 
              onClick={() => setShowTerms(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <div>
              <h3 className="text-white font-semibold mb-2">Terms of Service</h3>
              <p>By using ChatSphere, you agree to these terms:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You must be at least 13 years old to use this service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree not to use the service for illegal or harmful purposes</li>
                <li>You will not harass, abuse, or harm other users</li>
                <li>We reserve the right to terminate accounts that violate these terms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Privacy Policy</h3>
              <p>We respect your privacy and are committed to protecting your personal information:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>We collect only necessary information to provide our service</li>
                <li>Your chat messages are stored locally on your device</li>
                <li>We do not share your personal information with third parties</li>
                <li>You can delete your account and data at any time</li>
                <li>We use industry-standard security measures to protect your data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Contact Information</h3>
              <p>If you have any questions about these terms or privacy policy, please contact us at:</p>
              <p className="text-teal-400">chatspherelive@gmail.com</p>
            </div>

            <div className="text-xs text-gray-400 pt-4 border-t border-white/10">
              <p>Last updated: January 2025</p>
              <p>© 2025 ChatSphere. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <RotatingBackground />
      <div className="fixed inset-0 bg-black/50" aria-hidden="true"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen w-screen p-4 sm:p-6 font-sans">
        <div 
          className="w-full max-w-md p-6 sm:p-8 space-y-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative"
          style={{
            background: 'linear-gradient(135deg, rgba(56, 178, 172, 0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(139, 92, 246, 0.12) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 178, 172, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 178, 172, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* 装饰性光晕效果 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/10 via-transparent to-purple-400/10 pointer-events-none"></div>
          <div className="text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">ChatSphere</h1>
            <p className="mt-2 text-gray-300">Real-time Social Chat Community</p>
          </div>
          
          <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
            {error && <p className="text-red-300 text-center text-sm bg-red-900/40 p-3 rounded-lg">{error}</p>}
            
            <div>
              <label htmlFor="nickname" className="sr-only">Nickname</label>
              <input id="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 transition-all duration-200"
                placeholder="Nickname"
              />
            </div>
             {authMode !== 'guest' && (
               <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 transition-all duration-200"
                  placeholder="Password"
                  />
              </div>
             )}
             {authMode === 'register' && (
               <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 transition-all duration-200"
                  placeholder="Email Address"
                  />
              </div>
             )}

            {authMode !== 'login' && (
              <>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="age" className="sr-only">Age</label>
                    <input 
                      id="age" 
                      type="text" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      onKeyDown={(e) => {
                        // 只允许数字、退格、删除、Tab、Enter等键
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 transition-all duration-200"
                      placeholder="Age"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="gender" className="sr-only">Gender</label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}
                      className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 transition-all duration-200"
                    >
                      <option className="text-black">Male</option>
                      <option className="text-black">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="country" className="sr-only">Country</label>
                  <input 
                    id="country" 
                    type="text" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/30 transition-all duration-200"
                    placeholder="Country"
                  />
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-teal-400 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {getButtonText()}
              </button>
            </div>
          </form>
           <div className="text-center text-sm text-gray-300 space-x-2">
              {authMode !== 'login' && <button onClick={() => handleSetMode('login')} className="font-medium hover:text-white">Login</button>}
              {authMode !== 'register' && <span>&bull;</span>}
              {authMode !== 'register' && <button onClick={() => handleSetMode('register')} className="font-medium hover:text-white">Register</button>}
              {authMode !== 'guest' && <span>&bull;</span>}
              {authMode !== 'guest' && <button onClick={() => handleSetMode('guest')} className="font-medium hover:text-white">Chat as Guest</button>}
          </div>
          {/* Terms & Privacy Policy and Contact Us */}
          <div className="text-center text-xs text-gray-400 space-y-2 pt-4 border-t border-white/10">
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setShowTerms(true)}
                className="hover:text-teal-400 transition-colors duration-200 underline"
              >
                Terms & Privacy Policy
              </button>
              <span className="text-gray-500">•</span>
              <button 
                onClick={() => window.open('mailto:chatspherelive@gmail.com', '_blank')}
                className="hover:text-teal-400 transition-colors duration-200 underline"
              >
                Contact Us
              </button>
            </div>
            <div className="pt-2">
              Background by Unsplash & Picsum<br/>
              © 2025 ChatSphere
            </div>
          </div>
        </div>
      </div>
      {showTerms && <TermsModal />}
    </div>
  );
};

export default AuthScreen;
