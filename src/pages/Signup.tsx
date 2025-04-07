
import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SignupFormValues {
  doctorName: string;
  clinicName: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const { signUp, isLoading } = useAuth();
  const [signupError, setSignupError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    defaultValues: {
      doctorName: '',
      clinicName: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setSignupError(null);
    
    if (values.password !== values.confirmPassword) {
      form.setError('confirmPassword', { 
        type: 'manual', 
        message: "Passwords don't match" 
      });
      return;
    }

    try {
      await signUp(values.email, values.password, {
        name: values.doctorName,
        clinicName: values.clinicName,
        address: values.address
      });
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully!',
      });
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setSignupError(error.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-lg border shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-medical-500" />
            </div>
            <CardTitle className="text-xl font-semibold text-center">Create your ScriptScribe Account</CardTitle>
          </CardHeader>
          <CardContent>
            {signupError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{signupError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="doctorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor's Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Dr. John Doe" 
                            required 
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="City Health Clinic" 
                            required 
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Medical Street, Healthcare City" 
                          required 
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="********" 
                            type="password" 
                            required 
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center text-sm mt-4">
                  <p>Already have an account? <Link to="/login" className="text-medical-600 hover:underline">Login</Link></p>
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

export default Signup;
