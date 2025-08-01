import React, { useState } from 'react';
import { Logo } from '../components/ui/Logo';
import UserProfileDropdown from '../components/chat/UserProfileDropdown';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlices';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userData = useSelector(selectUser);

  console.log('User data fetched successfully:', userData);

  const handleOpenProfile = () => {
    navigate(`${userData?.username}`)
  }

  const handleOpenChat = () => {
    navigate('/chat');
  }

  // Toggle dropdown visibility
  const handleToggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-100 to-sky-50 flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center space-x-2">
          <a href="/">
            <Logo
              title=""
              size="lg"
              imageUrl="https://res.cloudinary.com/dnmp06kjg/image/upload/v1749984178/snapedit_1749984160484_ifftci.png"
              imageAlt="My App Logo"
            />
          </a>
        </div>

        <div className="relative text-center">
          <button
            onClick={handleToggleProfile}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 flex items-center justify-center text-white">
                <span className="text-lg font-semibold">{userData?.displayName.charAt(0) || "U"}</span>
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${userData?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </button>

          {isProfileOpen && userData && (
            <UserProfileDropdown
              userData={userData}
              onClose={() => setIsProfileOpen(false)}
              onNavigateToProfile={handleOpenProfile}
            />
          )}

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-24">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-brand-900 mb-6 animate-fade-in">
            Welcome to <span className="text-accent-600">PandaChat</span>
          </h1>
          <p className="text-xl md:text-2xl text-warm-700 mb-12 max-w-2xl mx-auto">
            Connect with friends, share moments, and experience seamless communication with our friendly panda mascot!
          </p>

          <button
            className="px-8 py-4 bg-gradient-to-r from-brand-400 to-accent-500 text-white text-xl font-semibold rounded-full shadow-lg hover:from-brand-500 hover:to-accent-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-300 animate-bounce-once"
            onClick={handleOpenChat}
          >
            Start Chatting Now
          </button>

          <div className="mt-16 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-300 to-sunshine-300 rounded-full blur-xl opacity-30 animate-pulse-soft"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-xl border-8 border-white">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 md:w-60 md:h-60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-100 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4 text-accent-400">PandaChat</h3>
              <p className="text-warm-300">
                Your friendly neighborhood chat app with a panda twist. Connect, share, and chat with ease.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-accent-400">Features</h3>
              <ul className="space-y-2">
                <li className="hover:text-accent-300 cursor-pointer">Group Chats</li>
                <li className="hover:text-accent-300 cursor-pointer">File Sharing</li>
                <li className="hover:text-accent-300 cursor-pointer">Video Calls</li>
                <li className="hover:text-accent-300 cursor-pointer">Panda Emojis</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-accent-400">Resources</h3>
              <ul className="space-y-2">
                <li className="hover:text-accent-300 cursor-pointer">Help Center</li>
                <li className="hover:text-accent-300 cursor-pointer">Community</li>
                <li className="hover:text-accent-300 cursor-pointer">Developers</li>
                <li className="hover:text-accent-300 cursor-pointer">Blog</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-accent-400">Legal</h3>
              <ul className="space-y-2">
                <li className="hover:text-accent-300 cursor-pointer">Privacy Policy</li>
                <li className="hover:text-accent-300 cursor-pointer">Terms of Service</li>
                <li className="hover:text-accent-300 cursor-pointer">Cookie Policy</li>
                <li className="hover:text-accent-300 cursor-pointer">Security</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-warm-700 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <p className="text-warm-400">© 2025 PandaChat. All rights reserved.</p>
            </div>

            {/* <div className="flex space-x-6">
              <div className="bg-warm-800 rounded-lg px-3 py-1 text-sm text-warm-300">
                粤ICP备202502541号
              </div>
              <div className="bg-warm-800 rounded-lg px-3 py-1 text-sm text-warm-300">
                粤鲁2-20250178
              </div>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;