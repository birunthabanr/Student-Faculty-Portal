import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import API_CONFIG from '../lib/config';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = API_CONFIG.AUTH.LOGIN;  
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 w-full h-full">
          {/* Abstract background patterns */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-24 left-24 w-36 h-36 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-40 w-44 h-44 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        </div>
      </div>

      <div className={`w-full max-w-md transition-all duration-1000 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Header with gradient */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-10 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to</h2>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-3">
                Personalized Portal
              </h1>
              <p className="text-gray-400 max-w-sm mx-auto">
                Your one-stop solution for academic management and collaboration between students and faculty.
              </p>
            </div>

            <div className="space-y-4">
              <button
            onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-3 flex items-center justify-center transition-colors duration-300 group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-70"></span>
                </span>
                <GoogleIcon className="mr-2" />
                <span className="relative">
                  {isLoading ? "Connecting..." : "Sign in with Google"}
                </span>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-800 text-gray-500">Or continue as</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <button className="bg-gray-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-300">
                  Student
                </button>
                <button className="bg-gray-700 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors duration-300">
                  Faculty
                </button>
                <button className="bg-gray-700 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition-colors duration-300">
                  Admin
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-gray-900 text-center">
            <p className="text-gray-500 text-xs">
              © 2025 Personalized Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;