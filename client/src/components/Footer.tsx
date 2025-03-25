import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white rounded-lg shadow-md p-5 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm">
        <div className="mb-2 md:mb-0">
          © {new Date().getFullYear()} LeetCode Question Retriever
        </div>
        <div>
          Made with care by <div> <a href="https://github.com/YanivGabay" className="text-blue-500 hover:underline">Yaniv Gabay</a></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 