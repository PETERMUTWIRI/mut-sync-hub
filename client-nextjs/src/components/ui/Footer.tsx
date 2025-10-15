"use client";
// src/components/ui/Footer.tsx
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Linkedin, Mail, Phone, ArrowUp, Send } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const solutions = [
    { name: "Automation", path: "/solutions/automation" },
    { name: "Analytics", path: "/solutions/analytics" },
    { name: "Integration", path: "/solutions/integration" },
    { name: "Security", path: "/solutions/security" },
  ];
  
  const resources = [
    { name: "Documentation", path: "/resources/docs" },
    { name: "Blog", path: "/resources/blog" },
    { name: "Webinars", path: "/resources/webinars" },
    { name: "API Reference", path: "/resources/api" },
  ];

  // Show/hide scroll-to-top button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate subscription
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-900/10 blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-indigo-900/10 blur-[100px]"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div>
            <motion.div 
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <h2 className="text-xl font-bold text-white">MutyncHub</h2>
            </motion.div>
            
            <motion.p 
              className="mb-4 text-neutral-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Empowering your digital future with cutting-edge solutions and seamless integration.
            </motion.p>
            
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-500" />
                <a href="tel:+254723570401" className="hover:text-white transition-colors">+254 723 570 401</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href="mailto:info@mutsynchub.com" className="hover:text-white transition-colors">info@mutsynchub.com</a>
              </div>
            </motion.div>
          </div>
          
          {/* Solutions */}
          <div>
            <motion.h3 
              className="text-lg font-semibold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Solutions
            </motion.h3>
            <ul className="space-y-3">
              {solutions.map((solution, index) => (
                <motion.li 
                  key={solution.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <Link 
                    href={solution.path} 
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>{solution.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <motion.h3 
              className="text-lg font-semibold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Resources
            </motion.h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <motion.li 
                  key={resource.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                >
                  <Link 
                    href={resource.path} 
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>{resource.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <motion.h3 
              className="text-lg font-semibold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Stay Updated
            </motion.h3>
            
            <motion.p 
              className="mb-4 text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Subscribe to our newsletter for the latest updates and insights.
            </motion.p>
            
            <motion.form 
              onSubmit={handleSubscribe}
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.form>
            
            {isSubscribed && (
              <motion.div 
                className="mt-3 text-green-400 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Thank you for subscribing!
              </motion.div>
            )}
          </div>
        </div>
        
        <Separator className="my-8 bg-neutral-800" />
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.p 
            className="text-sm text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            &copy; {new Date().getFullYear()} MutyncHub. All rights reserved.
          </motion.p>
          
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Button 
              asChild 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
            >
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button 
              asChild 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
            >
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
              </a>
            </Button>
            <Button 
              asChild 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
            >
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Back to top button */}
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </footer>
  );
}