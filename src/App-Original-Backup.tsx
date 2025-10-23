import { useState } from 'react';
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
import { Product } from './components/ProductCard';
import { CheckCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

type Page = 'landing' | 'healthcare' | 'electronics' | 'product' | 'cart' | 'checkout' | 'success' | 'about' | 'help' | 'search' | 'profile';

// Product data with prices including VAT (15%)
const healthCareProducts: Product[] = [
  {
    id: 1,
    name: 'Premium Vitamin D3 Supplement - 5000IU',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYm90dGxlJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjA0MjcwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Vitamins',
    rating: 4.8,
    store: 'healthcare'
  },
  {
    id: 2,
    name: 'Organic Omega-3 Fish Oil - Triple Strength',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1576437293196-fc3080b75964?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVnYSUyMGZpc2glMjBvaWwlMjBjYXBzdWxlc3xlbnwxfHx8fDE3NjA1NDAwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Supplements',
    rating: 4.9,
    store: 'healthcare'
  },
  {
    id: 3,
    name: 'Anti-Aging Vitamin C Serum with Hyaluronic Acid',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1665763630810-e6251bdd392d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2MDQ1NzUxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Skincare',
    rating: 4.7,
    store: 'healthcare'
  },
  {
    id: 4,
    name: 'Hydrating Face Moisturizer - Day & Night Cream',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1585652757146-e9d00bf2810c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwbW9pc3R1cml6ZXIlMjBjcmVhbXxlbnwxfHx8fDE3NjA0NjY5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Skincare',
    rating: 4.6,
    store: 'healthcare'
  },
  {
    id: 5,
    name: 'Premium Yoga Mat & Accessories Kit',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1746796751590-a8c0f15d4900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWF0JTIwZml0bmVzc3xlbnwxfHx8fDE3NjA1MDcwNDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Equipment',
    rating: 4.5,
    store: 'healthcare'
  },
  {
    id: 6,
    name: 'Resistance Exercise Bands Set - 5 Levels',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1588589212255-bcc6a2bbbf95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpc3RhbmNlJTIwZXhlcmNpc2UlMjBiYW5kc3xlbnwxfHx8fDE3NjA1NDAwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Equipment',
    rating: 4.4,
    store: 'healthcare'
  },
  {
    id: 7,
    name: 'Multivitamin Complex - Men & Women',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYm90dGxlJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjA0MjcwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Vitamins',
    rating: 4.3,
    store: 'healthcare'
  },
  {
    id: 8,
    name: 'Collagen Peptides Powder - Unflavored',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1576437293196-fc3080b75964?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVnYSUyMGZpc2glMjBvaWwlMjBjYXBzdWxlc3xlbnwxfHx8fDE3NjA1NDAwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Supplements',
    rating: 4.7,
    store: 'healthcare'
  },
  {
    id: 9,
    name: 'Natural Clay Face Mask - Detoxifying',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1665763630810-e6251bdd392d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc2MDQ1NzUxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Skincare',
    rating: 4.5,
    store: 'healthcare'
  },
  {
    id: 10,
    name: 'Probiotic Complex - 50 Billion CFU',
    price: 379.99,
    image: 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYm90dGxlJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjA0MjcwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Supplements',
    rating: 4.8,
    store: 'healthcare'
  }
];

const electronicsProducts: Product[] = [
  {
    id: 101,
    name: 'Pro Smartphone X12 - 256GB',
    price: 8999.99,
    image: 'https://images.unsplash.com/photo-1675953935267-e039f13ddd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzYwNDI1NzY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Phones',
    rating: 4.8,
    store: 'electronics'
  },
  {
    id: 102,
    name: 'Budget Smartphone A5 - 128GB',
    price: 2999.99,
    image: 'https://images.unsplash.com/photo-1675953935267-e039f13ddd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzYwNDI1NzY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Phones',
    rating: 4.3,
    store: 'electronics'
  },
  {
    id: 103,
    name: 'UltraBook Pro 15" - Core i7, 16GB RAM',
    price: 14999.99,
    image: 'https://images.unsplash.com/photo-1641430034785-47f6f91ab6cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA1MTI0ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Laptops',
    rating: 4.9,
    store: 'electronics'
  },
  {
    id: 104,
    name: 'Gaming Laptop GT7 - RTX 4060, 32GB RAM',
    price: 18999.99,
    image: 'https://images.unsplash.com/photo-1641430034785-47f6f91ab6cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjA1MTI0ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Laptops',
    rating: 4.7,
    store: 'electronics'
  },
  {
    id: 105,
    name: 'Wireless Noise-Canceling Headphones Pro',
    price: 3499.99,
    image: 'https://images.unsplash.com/photo-1632200004922-bc18602c79fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBhdWRpb3xlbnwxfHx8fDE3NjA0Mzc0NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Audio',
    rating: 4.8,
    store: 'electronics'
  },
  {
    id: 106,
    name: 'True Wireless Earbuds - Active Noise Canceling',
    price: 1799.99,
    image: 'https://images.unsplash.com/photo-1632200004922-bc18602c79fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBhdWRpb3xlbnwxfHx8fDE3NjA0Mzc0NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Audio',
    rating: 4.6,
    store: 'electronics'
  },
  {
    id: 107,
    name: 'USB-C Hub 7-in-1 - HDMI, USB 3.0, SD Card',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1616578781650-cd818fa41e57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2IlMjBodWIlMjBhZGFwdGVyfGVufDF8fHx8MTc2MDU0MDA5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Accessories',
    rating: 4.4,
    store: 'electronics'
  },
  {
    id: 108,
    name: 'Wireless Charging Pad - 15W Fast Charging',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1633381638729-27f730955c23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGNoYXJnaW5nJTIwcGFkfGVufDF8fHx8MTc2MDUzNTkxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Accessories',
    rating: 4.5,
    store: 'electronics'
  },
  {
    id: 109,
    name: 'Mechanical Gaming Keyboard - RGB Backlit',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBnYW1pbmd8ZW58MXx8fHwxNzYwNDQ2MDQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Accessories',
    rating: 4.7,
    store: 'electronics'
  },
  {
    id: 110,
    name: 'Premium Bluetooth Speaker - Waterproof',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1632200004922-bc18602c79fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBhdWRpb3xlbnwxfHx8fDE3NjA0Mzc0NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Audio',
    rating: 4.6,
    store: 'electronics'
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
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

  const handleRemoveItem = (productId: number) => {
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
                  : `No results found for "${searchQuery}"`
                }
              </p>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {searchResults.map(product => {
                    const ProductCard = require('./components/ProductCard').ProductCard;
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onProductClick={handleProductClick}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-gray-600 mb-6">Try searching for something else</p>
                  <Button 
                    onClick={handleBackToHome} 
                    className="electronics-gradient text-white rounded-2xl px-8 shadow-lg shadow-purple-500/30"
                  >
                    Back to Home
                  </Button>
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
