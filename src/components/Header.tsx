import { ShoppingCart, Search, User, Menu, X, LogOut, Heart, Home, Activity, Smartphone, Info, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/hooks';
import { createPortal } from 'react-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { customer, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogoClick(); // Go back to home
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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="hidden md:flex items-center gap-2 rounded-full h-10 px-4 hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {customer?.first_name?.[0]}{customer?.last_name?.[0]}
                    </div>
                    <span className="text-sm font-medium">{customer?.first_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-full hover:bg-gray-100 w-10 h-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
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

    {/* Mobile Menu - Rendered via Portal to document.body */}
    {createPortal(
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-[99999] shadow-2xl lg:hidden overflow-y-auto"
              >
              {/* Header Section */}
              <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-white"
                  >
                    Menu
                  </motion.h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* User Profile Section */}
                {isAuthenticated ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-purple-600 text-xl font-bold shadow-lg">
                        {customer?.first_name?.[0]}{customer?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {customer?.first_name} {customer?.last_name}
                        </h3>
                        <p className="text-purple-100 text-sm truncate">{customer?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => {
                          onNavigate?.('profile');
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 text-sm font-medium transition-all"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 text-sm font-medium transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => {
                      onNavigate?.('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-purple-600 rounded-2xl py-4 px-6 font-semibold text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Sign In / Register
                  </motion.button>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-6 space-y-2">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => {
                    onLogoClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all ${
                    currentPage === 'landing'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : 'hover:bg-gray-100 text-gray-700 active:scale-95'
                  }`}
                >
                  <Home className="w-5 h-5 flex-shrink-0" />
                  <span>Home</span>
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    onSelectStore?.('healthcare');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all ${
                    currentPage === 'healthcare'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'hover:bg-gray-100 text-gray-700 active:scale-95'
                  }`}
                >
                  <Activity className="w-5 h-5 flex-shrink-0" />
                  <span>Health & Wellness</span>
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  onClick={() => {
                    onSelectStore?.('electronics');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all ${
                    currentPage === 'electronics'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : 'hover:bg-gray-100 text-gray-700 active:scale-95'
                  }`}
                >
                  <Smartphone className="w-5 h-5 flex-shrink-0" />
                  <span>Electronics</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    onNavigate?.('about');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all ${
                    currentPage === 'about'
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-100 text-gray-700 active:scale-95'
                  }`}
                >
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <span>About Us</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => {
                    onNavigate?.('help');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all ${
                    currentPage === 'help'
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-100 text-gray-700 active:scale-95'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Contact</span>
                </motion.button>
              </div>

              {/* Quick Actions */}
              <div className="px-6 pb-6">
                <div className="border-t pt-6 grid grid-cols-2 gap-3">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => {
                      // TODO: Add wishlist functionality
                      setMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl py-4 px-4 font-medium text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    <Heart className="w-6 h-6" />
                    <span>Wishlist</span>
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    onClick={() => {
                      onCartClick();
                      setMobileMenuOpen(false);
                    }}
                    className="relative flex flex-col items-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl py-4 px-4 font-medium text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>Cart</span>
                    {cartItemCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                        {cartItemCount}
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
