import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Mail, KeyRound, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ForgotPasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ForgotPassword({ open, onOpenChange }: ForgotPasswordProps) {
  const [verificationStep, setVerificationStep] = useState<"request" | "success">("request");
  const { toast } = useToast();

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormValues) => {
      const response = await apiRequest("POST", "/api/reset-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
      setVerificationStep("success");
      
      // In development mode, show the token for easy testing
      if (data.token) {
        toast({
          title: "Development Mode",
          description: "Reset token: " + data.token,
          variant: "default",
          duration: 10000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to send reset email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetMutation.mutate(values);
  };

  const handleCloseAndReset = () => {
    setVerificationStep("request");
    resetForm.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {verificationStep === "request" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Forgot your password?</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your email address"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseAndReset}
                    className="sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="sm:order-2"
                    disabled={resetMutation.isPending}
                  >
                    {resetMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">○</span>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Send Reset Link
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-center">Check your email</DialogTitle>
            </DialogHeader>

            <div className="py-6 flex flex-col items-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              
              <p className="text-center mb-4">
                We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
              </p>
              
              <div className="flex items-center p-4 bg-orange-100 text-orange-800 rounded-lg mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">The email might take a few minutes to arrive. Check your spam folder if you don't see it.</span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCloseAndReset} className="w-full">
                Back to Login
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}