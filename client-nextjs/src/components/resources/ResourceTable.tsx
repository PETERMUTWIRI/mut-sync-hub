// src/components/resources/ResourceTable.tsx
import { FileText, Video, Code, BookOpen, Newspaper } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  date: string;
  tags: string[];
}

interface ResourceTableProps {
  resources: Resource[];
}

const iconMap = {
  pdf: <FileText size={16} className="text-blue-500" />,
  video: <Video size={16} className="text-purple-500" />,
  article: <BookOpen size={16} className="text-green-500" />,
  api: <Code size={16} className="text-yellow-500" />,
  tutorial: <BookOpen size={16} className="text-indigo-500" />,
  whitepaper: <Newspaper size={16} className="text-red-500" />,
};

const ResourceTable = ({ resources }: ResourceTableProps) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
              Resource
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Category
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Tags
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Date
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-800">
          {resources.map((resource) => (
            <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-5 w-5">
                    {iconMap[resource.type as keyof typeof iconMap] || iconMap.article}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900 dark:text-white">{resource.title}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-1 max-w-md">
                      {resource.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {resource.category}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(resource.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <a href={resource.url} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceTable;