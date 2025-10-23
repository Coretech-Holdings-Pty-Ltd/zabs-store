import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';

interface FilterSidebarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice: number;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
  maxPrice
}: FilterSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Categories</h3>
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {selectedCategories.length}
            </Badge>
          )}
        </div>
        <div className="space-y-3">
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category);
            return (
              <div 
                key={category} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-purple-50 border-2 border-purple-200' 
                    : 'border-2 border-transparent hover:bg-gray-50'
                }`}
                onClick={() => onCategoryChange(category)}
              >
                <Checkbox
                  id={category}
                  checked={isSelected}
                  onCheckedChange={() => onCategoryChange(category)}
                  className="border-2 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Label 
                  htmlFor={category}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {category}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-lg mb-6">Price Range</h3>
        <div className="space-y-6">
          <Slider
            min={0}
            max={maxPrice}
            step={50}
            value={priceRange}
            onValueChange={(value) => onPriceChange(value as [number, number])}
            className="[&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:shadow-lg"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 px-4 py-3 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl text-center">
              <div className="text-xs text-gray-600 mb-1">Min</div>
              <div className="font-bold text-purple-700">R{priceRange[0]}</div>
            </div>
            <div className="text-gray-400">—</div>
            <div className="flex-1 px-4 py-3 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl text-center">
              <div className="text-xs text-gray-600 mb-1">Max</div>
              <div className="font-bold text-purple-700">R{priceRange[1]}</div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <h3 className="font-bold text-lg mb-4">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3].map(rating => (
            <button
              key={rating}
              className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-purple-50 transition-all group"
            >
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gray-300" />
                ))}
              </div>
              <span className="text-sm font-medium group-hover:text-purple-600">& Up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
