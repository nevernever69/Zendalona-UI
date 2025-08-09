import React from 'react';
import { Outlet } from 'react-router-dom';
import LoginButton from '../components/LoginButton';

function Layout() {
  return (
    <div className="w-full h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Zendalona Assistant</h1>
          <LoginButton />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;