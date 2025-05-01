import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ChatAssistant from "@/components/shared/ChatAssistant";
import ForgotPassword from "@/components/auth/ForgotPassword";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Sign In or Register - Bookverse</title>
        <meta name="description" content="Sign in to your Bookverse account or create a new account to discover personalized book recommendations and save your favorite books." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow bg-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              {/* Auth Form Section */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="mb-6 text-center">
                  <h1 className="font-heading text-3xl font-bold mb-2">
                    Welcome to Bookverse
                  </h1>
                  <p className="text-muted-foreground">
                    {activeTab === "login" 
                      ? "Sign in to your account to continue" 
                      : "Create an account to get started"}
                  </p>
                </div>
                
                <Tabs
                  defaultValue="login"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="remember" 
                              className="mr-2"
                            />
                            <label htmlFor="remember" className="text-sm">
                              Remember me
                            </label>
                          </div>
                          <button 
                            type="button"
                            className="text-sm text-primary hover:underline"
                            onClick={() => setForgotPasswordOpen(true)}
                          >
                            Forgot password?
                          </button>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-white hover:bg-primary/90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2">○</span> Signing in...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <LogIn className="mr-2 h-4 w-4" /> Sign In
                            </span>
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="relative flex items-center justify-center my-6">
                      <div className="absolute w-full border-t border-gray-300"></div>
                      <div className="relative bg-white px-4 text-sm text-gray-500">OR</div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    
                    <div className="text-center mt-6">
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="text-primary font-semibold hover:underline"
                        >
                          Sign Up
                        </button>
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Confirm your password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-white hover:bg-primary/90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2">○</span> Creating account...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <UserPlus className="mr-2 h-4 w-4" /> Create Account
                            </span>
                          )}
                        </Button>
                        
                        <p className="text-xs text-center text-muted-foreground mt-4">
                          By signing up, you agree to our{" "}
                          <a href="#" className="text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                          .
                        </p>
                      </form>
                    </Form>
                    
                    <div className="text-center mt-6">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="text-primary font-semibold hover:underline"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Hero section */}
              <div className="hidden md:block bg-gradient-to-br from-primary to-secondary rounded-lg p-10 text-white">
                <div className="flex items-center mb-8">
                  <BookOpen className="mr-2 h-8 w-8" />
                  <h2 className="font-heading text-3xl font-bold">Bookverse</h2>
                </div>
                
                <h3 className="font-heading text-2xl font-bold mb-4">
                  Discover Your Next Favorite Book
                </h3>
                
                <p className="mb-6 text-white/80">
                  Join thousands of readers who use Bookverse to discover, track, and discuss their favorite books. Get personalized recommendations, save your reading list, and connect with fellow book lovers.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-full mr-4">✓</div>
                    <p>Access to thousands of free and premium books</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-full mr-4">✓</div>
                    <p>AI-powered book recommendations</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-full mr-4">✓</div>
                    <p>Save favorites and track your reading journey</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-full mr-4">✓</div>
                    <p>Connect with book lovers and share reviews</p>
                  </div>
                </div>
                
                <div className="relative w-full h-64 overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1513001900722-370f803f498d"
                    alt="Person reading book"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">
                      "Reading is essential for those who seek to rise above the ordinary." – Jim Rohn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      <ChatAssistant />
    </>
  );
}
