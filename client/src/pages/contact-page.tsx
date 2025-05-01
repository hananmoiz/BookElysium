import { useState } from "react";
import { Helmet } from "react-helmet";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ChatAssistant from "@/components/shared/ChatAssistant";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  const onSubmit = (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
      
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <>
      <Helmet>
        <title>Contact Us - Bookverse</title>
        <meta name="description" content="Get in touch with the Bookverse team for questions, feedback, or support." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions or feedback? Our team is here to help. Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="font-heading text-2xl font-bold mb-6">Send Us a Message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
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
                            <Input placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Subject of your message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your message" 
                              className="min-h-32" 
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">○</span> Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" /> Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
              
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h2 className="font-heading text-2xl font-bold mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Email</h3>
                        <p className="text-muted-foreground">support@bookverse.com</p>
                        <p className="text-muted-foreground">info@bookverse.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Phone</h3>
                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                        <p className="text-muted-foreground">Mon-Fri, 9AM-5PM EST</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Address</h3>
                        <p className="text-muted-foreground">
                          123 Book Street<br />
                          Reading, RG1 2LT<br />
                          United States
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">How do I reset my password?</h3>
                      <p className="text-muted-foreground">
                        You can reset your password by clicking on the "Forgot password?" link on the login page.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Can I download books for offline reading?</h3>
                      <p className="text-muted-foreground">
                        Yes, many books on our platform are available for download in various formats for offline reading.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">How do I cancel my subscription?</h3>
                      <p className="text-muted-foreground">
                        You can manage your subscription settings in your account profile under "Subscription".
                      </p>
                    </div>
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
