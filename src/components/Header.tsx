
import React from 'react';
import { FileText, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-medical-500" />
            </div>
            <div className="ml-2">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">ScriptScribe</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Voice-to-Text Prescription Assistant</p>
            </div>
          </div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <div className="mt-6 space-y-4">
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Dr. Assistant</span>
                  </div>
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Help</span>
                  </div>
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Settings</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dr. Assistant</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
