
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Menu, UserRound, LogOut, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, profile, signOut, isLoading } = useAuth();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10 w-full">
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-medical-500" />
            </div>
            <div className="ml-2">
              <h1 className="text-sm font-semibold text-gray-900">ScriptScribe</h1>
              <p className="text-xs text-gray-500 hidden xs:block">Voice-to-Text</p>
            </div>
          </Link>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1 rounded-md hover:bg-gray-100 focus:outline-none">
                  <Menu size={16} />
                  <span className="sr-only">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-0">
                <nav className="h-full flex flex-col">
                  <div className="p-3 border-b">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-medical-500 mr-2" />
                      <span className="font-medium text-sm">ScriptScribe</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto py-2">
                    <Link to="/" className="block px-3 py-2.5 hover:bg-gray-100">
                      <span className="text-sm font-medium text-gray-700">Prescriptions</span>
                    </Link>
                    {!user ? (
                      !isAuthPage && (
                        <>
                          <Link to="/login" className="block px-3 py-2.5 hover:bg-gray-100">
                            <span className="text-sm text-gray-700">Login</span>
                          </Link>
                          <Link to="/signup" className="block px-3 py-2.5 hover:bg-gray-100">
                            <span className="text-sm text-gray-700">Sign Up</span>
                          </Link>
                        </>
                      )
                    ) : (
                      <>
                        <div className="block px-3 py-2.5">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              {profile?.profilePic ? (
                                <AvatarImage src={profile.profilePic} alt={profile.name} />
                              ) : (
                                <AvatarFallback className="bg-medical-100 text-medical-800 text-xs">
                                  {getInitials(profile?.name || 'User')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="text-sm font-medium">{profile?.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{profile?.clinicName}</div>
                        </div>
                        <Link to="/profile" className="flex items-center w-full text-left px-3 py-2.5 hover:bg-gray-100">
                          <Settings className="h-3.5 w-3.5 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">My Profile</span>
                        </Link>
                        <button 
                          onClick={() => signOut()}
                          className="flex items-center w-full text-left px-3 py-2.5 hover:bg-gray-100"
                          disabled={isLoading}
                        >
                          <LogOut className="h-3.5 w-3.5 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                !isAuthPage && (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="text-sm">Login</Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm" className="text-sm">Sign Up</Button>
                    </Link>
                  </>
                )
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{profile?.name}</div>
                    <div className="text-xs text-gray-500">{profile?.clinicName}</div>
                  </div>
                  <Link to="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      {profile?.profilePic ? (
                        <AvatarImage src={profile.profilePic} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="bg-medical-100 text-medical-800 text-xs">
                          {getInitials(profile?.name || 'User')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm flex items-center gap-1"
                    onClick={() => signOut()}
                    disabled={isLoading}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
