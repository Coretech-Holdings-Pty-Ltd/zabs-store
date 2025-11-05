import { ShoppingCart, Search, User, Heart, Home, Activity, Smartphone, Zap, Pill } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth-context';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
  onSelectStore?: (store: 'healthcare' | 'electronics') => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onSearch?: (query: string) => void;
}

export function Header({ cartItemCount, onCartClick, onLogoClick, onSelectStore, onNavigate, currentPage, onSearch }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { customer, user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const NavLink = ({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`text-sm font-medium transition-all px-4 py-2 rounded-full ${
        active 
          ? 'bg-gray-900 text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer flex-shrink-0"
            onClick={onLogoClick}
          >
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              ZAB'S <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-500">Store</span>
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <NavLink onClick={onLogoClick} active={currentPage === 'landing'}>
              Home
            </NavLink>
            <NavLink onClick={() => onSelectStore?.('healthcare')} active={currentPage === 'healthcare'}>
              Health & Wellness
            </NavLink>
            <NavLink onClick={() => onSelectStore?.('electronics')} active={currentPage === 'electronics'}>
              Electronics
            </NavLink>
            <NavLink onClick={() => onNavigate?.('about')} active={currentPage === 'about'}>
              About
            </NavLink>
            <NavLink onClick={() => onNavigate?.('help')} active={currentPage === 'help'}>
              Contact
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100 w-10 h-10"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Wishlist - Desktop */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hidden md:block">
              <Button 
                variant="ghost" 
                size="icon"
                className="relative rounded-full hover:bg-gray-100 w-10 h-10"
                onClick={() => {/* TODO: Add wishlist functionality */}}
              >
                <Heart className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative rounded-full hover:bg-gray-100 w-10 h-10"
                onClick={onCartClick}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs rounded-full border-2 border-white">
                      {cartItemCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* Profile - Desktop */}
            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost"
                  className="hidden md:flex items-center gap-2 rounded-full h-10 px-4 hover:bg-gray-100"
                  onClick={() => onNavigate?.('profile')}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {customer?.first_name?.[0]}{customer?.last_name?.[0]}
                  </div>
                  <span className="text-sm font-medium">{customer?.first_name}</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="hidden md:flex bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full h-10 px-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                  onClick={() => onNavigate?.('profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pb-4 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <motion.div 
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="relative"
                >
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 h-14 bg-gray-50 border-2 border-gray-200 focus:border-purple-400 focus:outline-none rounded-2xl text-base transition-all"
                    autoFocus
                  />
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>

    {/* Modern Floating Bottom Navigation - Mobile Only */}
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <nav className="max-w-lg mx-auto">
        <div className="bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-full shadow-2xl shadow-black/10 px-3 py-3">
          <div className="flex items-center justify-between gap-1">
            
            {/* Cart - Far Left */}
            <motion.button
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCartClick}
              className="relative flex flex-col items-center justify-center p-3 rounded-full transition-all bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 shadow-md hover:shadow-xl border border-purple-100/50 min-w-[56px]"
            >
              <ShoppingCart className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
              {cartItemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 border-2 border-white shadow-lg"
                >
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </motion.div>
              )}
            </motion.button>

            {/* Health - Left of Home */}
            <motion.button
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectStore?.('healthcare')}
              className={`flex flex-col items-center justify-center p-3 rounded-full transition-all shadow-md hover:shadow-xl border min-w-[56px] ${
                currentPage === 'healthcare'
                  ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/50 border-cyan-400/50 scale-105'
                  : 'bg-gradient-to-br from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 text-cyan-600 border-cyan-100/50'
              }`}
            >
              <Pill className="w-6 h-6" strokeWidth={2.5} />
            </motion.button>

            {/* Home - Center (Larger) */}
            <motion.button
              whileHover={{ scale: 1.2, y: -6 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogoClick}
              className={`flex flex-col items-center justify-center p-4 rounded-full transition-all shadow-xl hover:shadow-2xl border-2 min-w-[64px] ${
                currentPage === 'landing'
                  ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white shadow-purple-500/50 border-purple-400/50 scale-110'
                  : 'bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-600 border-purple-100/50'
              }`}
            >
              <Home className="w-7 h-7" strokeWidth={2.5} />
            </motion.button>

            {/* Tech - Right of Home */}
            <motion.button
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectStore?.('electronics')}
              className={`flex flex-col items-center justify-center p-3 rounded-full transition-all shadow-md hover:shadow-xl border min-w-[56px] ${
                currentPage === 'electronics'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 border-indigo-400/50 scale-105'
                  : 'bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-600 border-indigo-100/50'
              }`}
            >
              <Zap className="w-6 h-6" strokeWidth={2.5} />
            </motion.button>

            {/* Profile - Far Right */}
            <motion.button
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate?.('profile')}
              className={`flex flex-col items-center justify-center p-3 rounded-full transition-all shadow-md hover:shadow-xl border min-w-[56px] ${
                currentPage === 'profile'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 border-purple-400/50 scale-105'
                  : user
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-600 border-purple-100/50'
                  : 'bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 text-gray-600 border-gray-100/50'
              }`}
            >
              {user ? (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-[11px] font-bold border-2 border-white/30 shadow-inner">
                  {customer?.first_name?.[0]}{customer?.last_name?.[0]}
                </div>
              ) : (
                <User className="w-6 h-6" strokeWidth={2.5} />
              )}
            </motion.button>

          </div>
        </div>
      </nav>
    </motion.div>
    </>
  );
}
