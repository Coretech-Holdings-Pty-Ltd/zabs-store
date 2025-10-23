import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { HealthCareStore } from './components/HealthCareStore';
import { ElectronicsStore } from './components/ElectronicsStore';
import { ProductDetails } from './components/ProductDetails';
import { Cart, CartItem } from './components/Cart';
import { Checkout } from './components/Checkout';
import { AboutPage } from './components/AboutPage';
import { HelpPage } from './components/HelpPage';
import { ProfilePage } from './components/ProfilePage';
import { Product, ProductCard } from './components/ProductCard';
import { CheckCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Medusa imports
import { fetchProductsByStore } from './lib/api';
import { StoreType } from './lib/config';

type Page = 'landing' | 'healthcare' | 'electronics' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'help' | 'search' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Medusa products state
  const [healthCareProducts, setHealthCareProducts] = useState<Product[]>([]);
  const [electronicsProducts, setElectronicsProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Fetch products from Medusa on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        // Fetch both stores' products in parallel
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

    loadProducts();
  }, []);

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

      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage 
            onSelectStore={handleSelectStore}
            featuredProducts={allProducts}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentPage === 'healthcare' && (
          <HealthCareStore
            products={healthCareProducts}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
            onBackToHome={handleBackToHome}
          />
        )}

        {currentPage === 'electronics' && (
          <ElectronicsStore
            products={electronicsProducts}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
            onBackToHome={handleBackToHome}
          />
        )}

        {currentPage === 'product' && selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={handleBackToStore}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onContinueShopping={handleContinueShopping}
            onCheckout={() => setCurrentPage('checkout')}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            items={cartItems}
            total={0}
            onBack={() => setCurrentPage('cart')}
            onComplete={handleOrderComplete}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onBack={handleBackToHome} />
        )}

        {currentPage === 'help' && (
          <HelpPage onBack={handleBackToHome} />
        )}

        {currentPage === 'profile' && (
          <ProfilePage onBack={handleBackToHome} />
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
