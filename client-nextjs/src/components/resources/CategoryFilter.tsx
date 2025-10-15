// src/components/resources/CategoryFilter.tsx

import React from 'react';
import { Filter, Library, BookOpen, Code, Video, LifeBuoy, Newspaper, FileText } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
};

type CategoryFilterProps = {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onTagClick: (tag: string) => void;
};

const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  onTagClick
}: CategoryFilterProps) => {
  return (
    <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        <Filter size={20} /> Filter Resources
      </h2>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${
              activeCategory === category.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-500 dark:text-blue-400">
                {category.icon}
              </span>
              <span>{category.name}</span>
            </div>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-xs">
              {category.count}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {['API', 'Integration', 'Dashboard', 'Analytics', 'Security', 'Onboarding', 'Best Practices', 'Data Models'].map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;