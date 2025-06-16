import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';

const App: React.FC = () => {
  return (
    <Router>
      <div className="h-screen w-screen bg-gray-100">
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/auth/callback' element={<OAuthCallback />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
