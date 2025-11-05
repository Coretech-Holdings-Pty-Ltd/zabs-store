import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Product, ProductCard } from './components/ProductCard';
import { CheckCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Lazy load heavy components for faster initial load
const HealthCareStore = lazy(() => import('./components/HealthCareStore').then(m => ({ default: m.HealthCareStore })));
const ElectronicsStore = lazy(() => import('./components/ElectronicsStore').then(m => ({ default: m.ElectronicsStore })));
const ProductDetails = lazy(() => import('./components/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./components/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./components/Checkout').then(m => ({ default: m.Checkout })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const HelpPage = lazy(() => import('./components/HelpPage').then(m => ({ default: m.HelpPage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Import CartItem type
import type { CartItem } from './components/Cart';

// Medusa imports
import { fetchProductsByStore } from './lib/api';
import { StoreType } from './lib/config';
import { preloadCache, CACHE_KEYS } from './lib/cache';

type Page = 'landing' | 'healthcare' | 'electronics' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'help' | 'search' | 'profile';

// Loading component for suspense fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Medusa products state - NOW LOADED LAZILY
  const [healthCareProducts, setHealthCareProducts] = useState<Product[]>([]);
  const [electronicsProducts, setElectronicsProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false); // Changed to false initially
  const [productsError, setProductsError] = useState<string | null>(null);

  // 🚀 PERFORMANCE BOOST: Preload products in background AFTER landing page loads
  useEffect(() => {
    // Preload products silently in background (non-blocking)
    const preloadProducts = () => {
      // Start preloading after a short delay to let landing page render first
      setTimeout(() => {
        console.log('🚀 Preloading products in background...');
        
        // Preload health products
        preloadCache(
          CACHE_KEYS.HEALTH_PRODUCTS,
          () => fetchProductsByStore('health'),
          10 * 60 * 1000 // 10 minutes
        );
        
        // Preload electronics products
        preloadCache(
          CACHE_KEYS.ELECTRONICS_PRODUCTS,
          () => fetchProductsByStore('electronics'),
          10 * 60 * 1000 // 10 minutes
        );
      }, 1000); // Wait 1 second after landing page loads
    };

    preloadProducts();
  }, []);

  // 🚀 LAZY LOAD: Only fetch products when user navigates to store pages
  useEffect(() => {
    const loadProductsForPage = async () => {
      // Only load products when navigating to store pages
      if (currentPage !== 'healthcare' && currentPage !== 'electronics' && currentPage !== 'search') {
        return;
      }

      // Don't reload if already loaded
      if (healthCareProducts.length > 0 && electronicsProducts.length > 0) {
        return;
      }

      try {
        setProductsLoading(true);
        setProductsError(null);

        console.log('Loading products for store page...');

        // Fetch both stores' products in parallel (will use cache if available)
        const [healthProducts, electronicsProductsData] = await Promise.all([
          fetchProductsByStore('health'),
          fetchProductsByStore('electronics'),
        ]);

        setHealthCareProducts(healthProducts);
        setElectronicsProducts(electronicsProductsData);
        
        console.log('Products loaded:', {
          health: healthProducts.length,
          electronics: electronicsProductsData.length,
        });
      } catch (error) {
        console.error('Error loading products:', error);
        setProductsError('Failed to load products from server. Please check your connection.');
        toast.error('Failed to load products. Please refresh the page.');
      } finally {
        setProductsLoading(false);
      }
    };

    loadProductsForPage();
  }, [currentPage, healthCareProducts.length, electronicsProducts.length]);

  const allProducts = [...healthCareProducts, ...electronicsProducts];
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectStore = (store: 'healthcare' | 'electronics') => {
    setCurrentPage(store);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    try {
      if (page === 'healthcare' || page === 'electronics') {
        setCurrentPage(page);
      } else if (page === 'about') {
        setCurrentPage('about');
      } else if (page === 'help') {
        setCurrentPage('help');
      } else if (page === 'profile') {
        setCurrentPage('profile');
      } else {
        console.warn(`Unknown page: ${page}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Unable to navigate. Please try again.');
    }
  };

  const handleProductClick = (product: Product) => {
    try {
      setSelectedProduct(product);
      setCurrentPage('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Product click error:', error);
      toast.error('Unable to view product details.');
    }
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    try {
      setCartItems(prev => {
        const existingItem = prev.find(item => item.product.id === product.id);
        
        if (existingItem) {
          toast.success(`Updated ${product.name} quantity in cart`);
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          toast.success(`Added ${product.name} to cart`);
          return [...prev, { product, quantity }];
        }
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Unable to add item to cart. Please try again.');
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveItem(productId);
        return;
      }
      
      setCartItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Unable to update quantity.');
    }
  };

  const handleRemoveItem = (productId: string) => {
    try {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
      toast.info('Item removed from cart');
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Unable to remove item.');
    }
  };

  const handleBackToHome = () => {
    try {
      setCurrentPage('landing');
      setSelectedProduct(null);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleBackToStore = () => {
    try {
      if (selectedProduct) {
        setCurrentPage(selectedProduct.store);
        setSelectedProduct(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleContinueShopping = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderComplete = () => {
    try {
      setCurrentPage('success');
      setCartItems([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Order completion error:', error);
      toast.error('There was an issue completing your order.');
    }
  };

  const handleSearch = (query: string) => {
    try {
      if (!query || query.trim() === '') {
        toast.error('Please enter a search term');
        return;
      }
      setSearchQuery(query.trim());
      setCurrentPage('search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Unable to perform search.');
    }
  };

  const searchResults = searchQuery
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.store.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Show loading state while products are being fetched
  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center px-4">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-white"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ZAB'S Store
          </h2>
          <p className="text-gray-600 text-lg animate-pulse">Preparing your shopping experience...</p>
        </div>
      </div>
    );
  }

  // Show error state if products failed to load
  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{productsError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="electronics-gradient text-white rounded-xl px-6"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setCurrentPage('cart')}
        onLogoClick={handleBackToHome}
        onSelectStore={handleSelectStore}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onSearch={handleSearch}
      />

      <main className="flex-1 pb-24 lg:pb-0">{/* Add bottom padding for floating mobile nav */}
        {currentPage === 'landing' && (
          <LandingPage 
            onSelectStore={handleSelectStore}
            featuredProducts={allProducts}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentPage === 'healthcare' && (
          <Suspense fallback={<PageLoader />}>
            <HealthCareStore
              products={healthCareProducts}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              onBackToHome={handleBackToHome}
            />
          </Suspense>
        )}

        {currentPage === 'electronics' && (
          <Suspense fallback={<PageLoader />}>
            <ElectronicsStore
              products={electronicsProducts}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              onBackToHome={handleBackToHome}
            />
          </Suspense>
        )}

        {currentPage === 'product' && selectedProduct && (
          <Suspense fallback={<PageLoader />}>
            <ProductDetails
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              onBack={handleBackToStore}
            />
          </Suspense>
        )}

        {currentPage === 'cart' && (
          <Suspense fallback={<PageLoader />}>
            <Cart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onContinueShopping={handleContinueShopping}
              onCheckout={() => setCurrentPage('checkout')}
            />
          </Suspense>
        )}

        {currentPage === 'checkout' && (
          <Suspense fallback={<PageLoader />}>
            <Checkout
              items={cartItems}
              total={0}
              onBack={() => setCurrentPage('cart')}
              onComplete={handleOrderComplete}
            />
          </Suspense>
        )}

        {currentPage === 'about' && (
          <Suspense fallback={<PageLoader />}>
            <AboutPage onBack={handleBackToHome} />
          </Suspense>
        )}

        {currentPage === 'help' && (
          <Suspense fallback={<PageLoader />}>
            <HelpPage onBack={handleBackToHome} />
          </Suspense>
        )}

        {currentPage === 'profile' && (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage 
              onBack={handleBackToHome}
              onViewProduct={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          </Suspense>
        )}

        {currentPage === 'search' && (
          <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
              <h1 className="text-3xl md:text-4xl mb-2">Search Results</h1>
              <p className="text-gray-600 mb-8 md:mb-12">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} ${searchResults.length === 1 ? 'result' : 'results'} for "${searchQuery}"`
                  : `No exact matches found for "${searchQuery}"`
                }
              </p>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {searchResults.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No exact matches</h3>
                    <p className="text-gray-600 mb-6">We couldn't find products matching "{searchQuery}"</p>
                    <Button 
                      onClick={handleBackToHome} 
                      variant="outline"
                      className="rounded-2xl px-8"
                    >
                      Back to Home
                    </Button>
                  </div>

                  <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <span className="text-purple-600">✨</span>
                      You might like these products
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {[...healthCareProducts, ...electronicsProducts].slice(0, 8).map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onProductClick={handleProductClick}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'success' && (
          <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 md:p-6">
            <div className="text-center max-w-md bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <div className="mb-8 inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 electronics-gradient rounded-full shadow-2xl shadow-purple-500/40">
                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl mb-4">Order Complete!</h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Thank you for shopping with ZAB'S Store! Your order has been confirmed and will be processed shortly.
                You'll receive an email confirmation with tracking details.
              </p>
              <Button 
                onClick={handleBackToHome}
                className="electronics-gradient text-white hover:opacity-90 rounded-2xl px-8 h-12 shadow-lg shadow-purple-500/30"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <Toaster position="top-right" />
    </div>
  );
}
