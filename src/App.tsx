
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Prescription from "./pages/Prescription";
import DoctorProfile from "./pages/DoctorProfile";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient();

// Protected route component with session expiry check
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, sessionExpiresAt } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // If there's a session expiry time, show a countdown notification when less than 5 minutes remain
    if (sessionExpiresAt) {
      const currentTime = new Date();
      const timeRemaining = sessionExpiresAt.getTime() - currentTime.getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (timeRemaining > 0 && timeRemaining < fiveMinutesInMs) {
        const minutesRemaining = Math.floor(timeRemaining / 60000);
        toast({
          title: "Session expiring soon",
          description: `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`,
          variant: "warning",
        });
      }
    }
  }, [sessionExpiresAt, toast]);
  
  if (isLoading) return <div className="p-8 flex justify-center">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Auth routes that redirect to home if already logged in
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="p-8 flex justify-center">Loading...</div>;
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Main app with routing
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        user ? <Index /> : <Navigate to="/login" />
      } />
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/signup" element={
        <AuthRoute>
          <Signup />
        </AuthRoute>
      } />
      <Route path="/prescription" element={
        <ProtectedRoute>
          <Prescription />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <DoctorProfile />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
