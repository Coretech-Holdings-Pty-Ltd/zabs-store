import { Mail, Instagram, Facebook, Twitter, Linkedin, Phone, MapPin, Send } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-3">
              ZAB'S <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Store</span>
            </h2>
            <p className="text-gray-400 mb-4 text-sm">
              Your premium destination for health, wellness, and cutting-edge electronics.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-healthcare rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-healthcare rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-healthcare rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-healthcare rounded-full flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-3">Shop</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button onClick={() => onNavigate?.('healthcare')} className="hover:text-healthcare transition-colors">
                  Health & Wellness
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('electronics')} className="hover:text-healthcare transition-colors">
                  Electronics
                </button>
              </li>
              <li><a href="#" className="hover:text-healthcare transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-healthcare transition-colors">Best Sellers</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <button onClick={() => onNavigate?.('help')} className="hover:text-healthcare transition-colors">
                  Help Center
                </button>
              </li>
              <li><a href="#" className="hover:text-healthcare transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-healthcare transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-healthcare transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-3">Newsletter</h3>
            <p className="text-gray-400 mb-3 text-sm">
              Get exclusive deals and updates
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-full flex-1"
              />
              <Button className="electronics-gradient text-white hover:opacity-90 rounded-full w-12 h-12 p-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-healthcare" />
              <a href="tel:+27111234567" className="hover:text-white transition-colors">
                +27 11 123 4567
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-healthcare" />
              <a href="mailto:support@zabsstore.co.za" className="hover:text-white transition-colors">
                support@zabsstore.co.za
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-healthcare" />
              <span>Johannesburg, South Africa</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2025 ZAB'S Store. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => onNavigate?.('about')} className="hover:text-white transition-colors">
              About Us
            </button>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
