import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, useLocation as useRouter } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, ShieldCheck, XCircle, LogIn } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// This component is rendered on the /reset-password/:token route
export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/reset-password/:token");
  const token = params?.token;
  const { toast } = useToast();
  const [resetStatus, setResetStatus] = useState<"verifying" | "valid" | "invalid" | "success">("verifying");

  // Verify token
  const { isLoading, isError, isSuccess } = useQuery<unknown, Error, unknown, [string]>({
    queryKey: [`/api/reset-password/${token}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!token,
    retry: false,
  });
  
  // Handle query success/error
  useEffect(() => {
    if (isSuccess) {
      setResetStatus("valid");
    } else if (isError) {
      setResetStatus("invalid");
    }
  }, [isSuccess, isError]);

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      if (!token) throw new Error("Missing token");
      const response = await apiRequest(
        "POST", 
        `/api/reset-password/${token}`, 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      setResetStatus("success");
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now login with your new password.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to reset password",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate({ password: values.password });
  };

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Verifying Reset Link</CardTitle>
          <CardDescription>
            Please wait while we verify your reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (resetStatus === "invalid") {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-red-600">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <XCircle className="h-16 w-16 text-red-600 mb-4" />
          <p className="text-center">
            Please request a new password reset link to continue.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (resetStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-green-600">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been reset successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <ShieldCheck className="h-16 w-16 text-green-600 mb-4" />
          <p className="text-center">
            You can now log in with your new password.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBackToLogin} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Reset Your Password</CardTitle>
        <CardDescription>
          Enter a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </span>
              ) : (
                <span className="flex items-center">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Reset Password
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={handleBackToLogin}>
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}