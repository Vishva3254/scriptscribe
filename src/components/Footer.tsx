
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-2 sm:py-3 mt-auto">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center text-xs sm:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ScriptScribe. All rights reserved.</p>
          <p className="mt-0.5 text-xs">A speech-to-text prescription assistant for healthcare professionals.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
