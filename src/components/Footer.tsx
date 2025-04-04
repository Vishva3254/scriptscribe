
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-4 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ScriptScribe. All rights reserved.</p>
          <p className="mt-1">A speech-to-text prescription assistant for healthcare professionals.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
