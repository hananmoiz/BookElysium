import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

// This component is rendered on the /verify/:token route
export default function VerifyAccount() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/verify/:token");
  const token = params?.token;
  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "failed">("verifying");
  
  // Verify token
  const { isLoading } = useQuery<unknown, Error, unknown, [string]>({
    queryKey: [`/api/verify/${token}`],
    queryFn: getQueryFn(),
    enabled: !!token,
    retry: false,
    onSuccess: () => {
      setVerificationStatus("success");
    },
    onError: () => {
      setVerificationStatus("failed");
    },
  });
  
  const handleGoToLogin = () => {
    navigate("/auth");
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Verifying Your Account</CardTitle>
          <CardDescription>
            Please wait while we verify your account...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (verificationStatus === "failed") {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-red-600">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <XCircle className="h-16 w-16 text-red-600 mb-4" />
          <p className="text-center">
            The verification link is invalid or has expired. Please try signing up again.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGoToLogin} className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-green-600">Account Verified!</CardTitle>
        <CardDescription>
          Your account has been successfully verified.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
        <p className="text-center">
          Thank you for verifying your email address. You can now log in and enjoy all features of Bookverse.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGoToLogin} className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Go to Login
        </Button>
      </CardFooter>
    </Card>
  );
}