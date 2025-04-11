
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { FileText, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const { signIn, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError(null);
    try {
      await signIn(values.email, values.password);
    } catch (error: any) {
      setLoginError(error.message || 'Failed to login. Please check your credentials and try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md border shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-medical-500" />
            </div>
            <CardTitle className="text-xl font-semibold text-center">Login to ScriptScribe</CardTitle>
            <CardDescription className="text-center">
              <span className="flex items-center justify-center gap-1 text-xs mt-2">
                <Clock className="h-3 w-3" /> 
                Session expires after 24 hours for security
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="doctor@example.com" 
                          type="email" 
                          required 
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="********" 
                          type="password" 
                          required 
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <div className="text-center text-sm mt-4">
                  <p>Don't have an account? <Link to="/signup" className="text-medical-600 hover:underline">Sign Up</Link></p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
