'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  categories?: { id: string; label: string }[];
  showDifficultyFilter?: boolean;
  showPriceFilter?: boolean;
  showRatingFilter?: boolean;
}

export interface FilterState {
  category: string | null;
  difficulty: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
}

export function SearchFilter({
  onSearch,
  onFilterChange,
  categories = [],
  showDifficultyFilter = false,
  showPriceFilter = false,
  showRatingFilter = false,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    difficulty: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
  });

  const difficultyOptions = ['Fácil', 'Medio', 'Difícil'];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    const newFilters = { ...filters, category: categoryId };
    handleFilterChange(newFilters);
  };

  const handleDifficultyChange = (difficulty: string | null) => {
    const newFilters = { ...filters, difficulty };
    handleFilterChange(newFilters);
  };

  const handlePriceChange = (minPrice: number | null, maxPrice: number | null) => {
    const newFilters = { ...filters, minPrice, maxPrice };
    handleFilterChange(newFilters);
  };

  const handleRatingChange = (minRating: number | null) => {
    const newFilters = { ...filters, minRating };
    handleFilterChange(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters: FilterState = {
      category: null,
      difficulty: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
    };
    setFilters(emptyFilters);
    handleFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== null).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar tours, servicios..."
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-orange-600 transition-colors font-medium text-gray-700"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-orange-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-6 animate-in fade-in duration-200">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Categoría</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(filters.category === cat.id ? null : cat.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      filters.category === cat.id
                        ? 'border-orange-600 bg-orange-50 text-orange-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Filter */}
          {showDifficultyFilter && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Dificultad</h3>
              <div className="space-y-2">
                {difficultyOptions.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(filters.difficulty === diff ? null : diff)}
                    className={`w-full text-left p-2 rounded-lg border-2 transition-all font-medium ${
                      filters.difficulty === diff
                        ? 'border-orange-600 bg-orange-50 text-orange-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Filter */}
          {showPriceFilter && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Precio (CLP)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Desde</label>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceChange(e.target.value ? Number(e.target.value) : null, filters.maxPrice)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Hasta</label>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceChange(filters.minPrice, e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rating Filter */}
          {showRatingFilter && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Calificación Mínima</h3>
              <div className="space-y-2">
                {[4, 4.5, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(filters.minRating === rating ? null : rating)}
                    className={`w-full text-left p-2 rounded-lg border-2 transition-all font-medium ${
                      filters.minRating === rating
                        ? 'border-orange-600 bg-orange-50 text-orange-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    ⭐ {rating}+
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
