import React from 'react';

interface HeaderProps {
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ subtitle }) => {
  return (
    <header className="bg-white rounded-lg shadow-md p-5 mb-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 text-center">
        LeetCode Question Retriever
      </h1>
      {subtitle && (
        <p className="text-center text-gray-600 text-sm mt-2">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default Header; 