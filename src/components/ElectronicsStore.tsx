import { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, Zap, X } from 'lucide-react';
import { ProductCard, Product } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface ElectronicsStoreProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onBackToHome: () => void;
}

export function ElectronicsStore({ products, onAddToCart, onProductClick, onBackToHome }: ElectronicsStoreProps) {
  const categories = ['Phones', 'Laptops', 'Accessories', 'Audio'];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12); // Show 12 products initially
  const PRODUCTS_PER_PAGE = 12;

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    handleFilterChange();
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    handleFilterChange();
  };

  const filteredProducts = products
    .filter(p => 
      (selectedCategories.length === 0 || selectedCategories.includes(p.category)) &&
      p.price >= priceRange[0] && p.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  // Get products to display (paginated)
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  // Reset display count when filters change
  const handleFilterChange = () => {
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, filteredProducts.length));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern Hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTIwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-100"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBackToHome}
            whileHover={{ x: -4 }}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-4"
          >
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="text-white/80 text-xs font-medium mb-1">Discover Our</div>
              <h1 className="text-3xl md:text-5xl font-bold">Electronics</h1>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl"
          >
            Latest smartphones, laptops, audio equipment, and tech accessories
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2"
          >
            {categories.map((cat, idx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant="outline"
                  className={`bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-4 py-2 text-sm cursor-pointer transition-all ${
                    selectedCategories.includes(cat) ? 'bg-white/30 border-white' : ''
                  }`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Control Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-4 md:p-6 shadow-lg mb-8 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">{filteredProducts.length}</div>
                <div className="text-sm text-gray-500">Products Available</div>
              </div>
              
              {selectedCategories.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([0, 20000]);
                    }}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full"
                  >
                    Clear All
                  </Button>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Mobile Filter Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 lg:flex-none">
                <Button 
                  onClick={() => setFilterOpen(true)}
                  className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-12 shadow-lg shadow-purple-500/30"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                  {selectedCategories.length > 0 && (
                    <Badge className="ml-2 bg-white text-purple-700 hover:bg-white">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </motion.div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[220px] rounded-2xl border-2 border-gray-200 h-12 bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="featured">✨ Featured</SelectItem>
                  <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                  <SelectItem value="price-high">💎 Price: High to Low</SelectItem>
                  <SelectItem value="rating">⭐ Highest Rated</SelectItem>
                  <SelectItem value="name">🔤 Name: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24 bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-6 h-6 text-purple-600" />
                  Filters
                </h3>
                {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 20000) && (
                  <Badge className="bg-purple-100 text-purple-700">
                    {selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0)}
                  </Badge>
                )}
              </div>
              
              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                maxPrice={20000}
              />
              
              {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 20000) && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-12 shadow-lg shadow-purple-500/30"
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([0, 20000]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <>
                <motion.div 
                  layout
                  className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                  {displayedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        onProductClick={onProductClick}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Load More Button */}
                {hasMore && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-12"
                  >
                    <Button
                      onClick={loadMore}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl px-12 h-14 text-base shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transition-all"
                    >
                      Load More Products
                      <span className="ml-2 text-sm opacity-80">
                        ({filteredProducts.length - displayCount} remaining)
                      </span>
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-16 text-center shadow-lg border border-gray-100"
              >
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold mb-4">No products found</h3>
                <p className="text-gray-600 mb-8 text-lg">Try adjusting your filters or browse all products</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl px-8 h-14 shadow-lg shadow-purple-500/30"
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([0, 20000]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setFilterOpen(false)}
            />
            
            {/* Filter Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-6 h-6 text-purple-600" />
                    Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFilterOpen(false)}
                    className="rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Filters */}
                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={handleCategoryChange}
                  priceRange={priceRange}
                  onPriceChange={handlePriceChange}
                  maxPrice={20000}
                />

                {/* Apply Button */}
                <div className="sticky bottom-0 bg-white pt-6 mt-8 border-t">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-14 text-lg shadow-xl shadow-purple-500/30"
                    onClick={() => setFilterOpen(false)}
                  >
                    Show {filteredProducts.length} Products
                  </Button>
                  {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 20000) && (
                    <Button
                      variant="outline"
                      className="w-full mt-3 rounded-2xl h-12"
                      onClick={() => {
                        setSelectedCategories([]);
                        setPriceRange([0, 20000]);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
