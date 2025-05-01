import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ExplorePage from "@/pages/explore-page";
import AuthPage from "@/pages/auth-page";
import BookDetailPage from "@/pages/book-detail-page";
import SavedBooksPage from "@/pages/saved-books-page";
import ProfilePage from "@/pages/profile-page";
import ContactPage from "@/pages/contact-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/books/:id" component={BookDetailPage} />
      <Route path="/contact" component={ContactPage} />
      <ProtectedRoute path="/saved" component={SavedBooksPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
