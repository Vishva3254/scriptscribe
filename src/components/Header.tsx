
import React from 'react';
import { FileText, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-medical-500" />
            </div>
            <div className="ml-2">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">ScriptScribe</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Voice-to-Text Prescription Assistant</p>
            </div>
          </div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-gray-100 focus:outline-none">
                  <Menu size={20} />
                  <span className="sr-only">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-0">
                <nav className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-medical-500 mr-2" />
                      <span className="font-medium">ScriptScribe</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto py-2">
                    <div className="px-4 py-3 hover:bg-gray-100">
                      <span className="text-sm font-medium text-gray-700">Dr. Assistant</span>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-100">
                      <span className="text-sm text-gray-700">Help</span>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-100">
                      <span className="text-sm text-gray-700">Settings</span>
                    </div>
                  </div>
                </nav>
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
