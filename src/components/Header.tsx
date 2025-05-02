
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Menu, X, User, LogOut, Settings, FilePlus, Archive } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Successfully signed out',
        description: 'Come back soon!',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'There was a problem signing you out.',
        variant: 'destructive',
      });
    }
  };

  // Navigation items when logged in
  const navItems = [
    { path: '/', label: 'New Prescription', icon: FilePlus },
    { path: '/saved-prescriptions', label: 'Saved Prescriptions', icon: Archive },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <header className="bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1 bg-medical-50 rounded-md">
            <FileText className="h-6 w-6 text-medical-600" />
          </div>
          <span className="font-medium text-gray-800 text-lg hidden sm:inline">ScriptScribe</span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center ${location.pathname === item.path ? 'bg-medical-50 text-medical-700' : ''}`}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        )}

        {/* User Menu (Desktop) */}
        {user ? (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.profilePic || ''} />
                <AvatarFallback className="bg-medical-100 text-medical-800">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium leading-none">{profile?.name || 'User'}</p>
                <p className="text-xs text-gray-500 leading-tight">{profile?.email || user.email}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-red-500" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="hidden md:block">
            <Button size="sm" onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white z-50 border-b shadow-sm">
          <div className="p-3 space-y-3">
            {user ? (
              <>
                <div className="p-2 flex items-center gap-3 border-b pb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.profilePic || ''} />
                    <AvatarFallback className="bg-medical-100 text-medical-800">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{profile?.email || user.email}</p>
                  </div>
                </div>
                
                {/* Nav Items */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        variant={location.pathname === item.path ? "secondary" : "ghost"}
                        className={`w-full justify-start ${location.pathname === item.path ? 'bg-medical-50 text-medical-700' : ''}`}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 mt-2"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate('/signup');
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
