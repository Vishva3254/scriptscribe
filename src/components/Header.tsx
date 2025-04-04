
import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-medical-500" />
            </div>
            <div className="ml-2">
              <h1 className="text-xl font-semibold text-gray-900">ScriptScribe</h1>
              <p className="text-xs text-gray-500">Voice-to-Text Prescription Assistant</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">Dr. Assistant</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
