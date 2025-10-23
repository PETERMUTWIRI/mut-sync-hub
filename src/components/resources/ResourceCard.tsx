// src/components/resources/ResourceCard.tsx
import { motion } from 'framer-motion';
import { FileText, Video, Code, BookOpen, LifeBuoy, Newspaper } from 'lucide-react';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'api' | 'guides' | 'support' | 'blog' | 'whitepapers';
  type: 'pdf' | 'video' | 'article' | 'api' | 'tutorial' | 'whitepaper';
  url: string;
  date: string;
  tags: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  featured?: boolean;
}

const iconMap = {
  pdf: <FileText size={18} />,
  video: <Video size={18} />,
  article: <BookOpen size={18} />,
  api: <Code size={18} />,
  tutorial: <BookOpen size={18} />,
  whitepaper: <FileText size={18} />
};

const categoryColors = {
  documentation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  api: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  guides: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  support: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  blog: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  whitepapers: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
};

const ResourceCard = ({ resource }: { resource: Resource }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Show thumbnail for blog/support resources if available */}
      {(resource.category === 'blog' || resource.category === 'support') && resource.thumbnail && (
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-40 object-cover rounded-t-xl mb-2 hover:opacity-90 transition-opacity"
          />
        </a>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`${categoryColors[resource.category]} text-xs font-medium px-2.5 py-1 rounded-full`}>
            {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {new Date(resource.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-blue-500 dark:text-blue-400">
            {iconMap[resource.type]}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {resource.title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[3rem]">
          {resource.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map(tag => (
            <span 
              key={tag} 
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <a 
            href={resource.url} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
          >
            View resource
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
          {resource.level && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;