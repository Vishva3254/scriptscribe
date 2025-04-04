
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-2 mt-auto w-full">
      <div className="container mx-auto px-3">
        <div className="text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ScriptScribe. All rights reserved.</p>
          <p className="mt-0.5 text-xs">A speech-to-text prescription assistant.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
