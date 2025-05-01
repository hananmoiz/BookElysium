import { Helmet } from "react-helmet";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrendingBooks from "@/components/home/TrendingBooks";
import MostPurchased from "@/components/home/MostPurchased";
import PersonalizedRecommendations from "@/components/home/PersonalizedRecommendations";
import Features from "@/components/home/Features";
import Newsletter from "@/components/home/Newsletter";
import ChatAssistant from "@/components/shared/ChatAssistant";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Bookverse - Discover Your Next Great Read</title>
        <meta name="description" content="Discover your next great read with Bookverse - the ultimate platform for book lovers with personalized recommendations and AI-powered assistance." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Hero />
          <FeaturedCategories />
          <TrendingBooks />
          <MostPurchased />
          <PersonalizedRecommendations />
          <Features />
          <Newsletter />
        </main>
        
        <Footer />
      </div>
      
      <ChatAssistant />
    </>
  );
}
