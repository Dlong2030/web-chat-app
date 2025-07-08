import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';
import PrivateRoute from './routes/PrivateRoute';
import ChatApp from './pages/Chats/ChatApp';
import UserProfile from './pages/UserProfile';

const App: React.FC = () => {
  return (
    <Router>
      <div className="h-screen w-screen bg-gray-100">
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path='/chat' element={<ChatApp />} />
          <Route path='/:username' element={<UserProfile />} />
          <Route path='/auth/callback' element={<OAuthCallback />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
