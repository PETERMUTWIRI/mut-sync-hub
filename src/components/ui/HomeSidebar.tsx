// import React from "react";
// import { Link } from "react-router-dom";
// import { Menu, Sun, Book, LifeBuoy, Home, X, ChevronDown } from "lucide-react";

// interface HomeSidebarProps {
//   open: boolean;
//   onClose: () => void;
// }

// const navItems = [
//   { to: "/home", label: "Home", icon: (theme: string) => <Home className="h-5 w-5" color={theme === 'dark' ? '#1de9b6' : '#1de9b6'} /> },
//   { to: "/solutions", label: "Solutions", icon: (theme: string) => <Sun className="h-5 w-5" color={theme === 'dark' ? '#1de9b6' : '#1de9b6'} /> },
//   { to: "/resources", label: "Resources", icon: (theme: string) => <Book className="h-5 w-5" color={theme === 'dark' ? '#1de9b6' : '#1de9b6'} /> },
//   { to: "/support", label: "Support", icon: (theme: string) => <LifeBuoy className="h-5 w-5" color={theme === 'dark' ? '#1de9b6' : '#1de9b6'} /> },
// ];

// const solutionServices = [
//   { label: "SaaS Applications", to: "/solutions#saas" },
//   { label: "Full-Stack Web Development", to: "/solutions#fullstack" },
//   { label: "Dynamic Systems Integration", to: "/solutions#integration" },
//   { label: "Cloud Solutions", to: "/solutions#cloud" },
//   { label: "AI Agents and Chatbots", to: "/solutions#ai" },
// ];

// const resourceLinks = [
//   { label: "Documentation", to: "/resources#docs" },
//   { label: "API Reference", to: "/resources#api" },
//   { label: "Guides & Tutorials", to: "/resources#guides" },
//   { label: "Support Center", to: "/resources#support" },
// ];

// const supportLinks = [
//   { label: "Help Center", to: "/support#help" },
//   { label: "Contact Us", to: "/support#contact" },
//   { label: "Community Forum", to: "/support#community" },
//   { label: "System Status", to: "/support#status" },
// ];

// const HomeSidebar: React.FC<HomeSidebarProps> = ({ open, onClose }) => {
//   const [solutionsOpen, setSolutionsOpen] = React.useState(false);
//   const [resourcesOpen, setResourcesOpen] = React.useState(false);
//   const [supportOpen, setSupportOpen] = React.useState(false);
//   if (!open) return null;
//   // Detect theme
//   const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
//   return (
//     <div className="fixed inset-0 z-[100] bg-black/40 flex">
//       <div className="relative w-72 max-w-full h-screen bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transition-colors">
//         <button
//           className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800"
//           onClick={onClose}
//           aria-label="Close sidebar"
//         >
//           <X className="h-6 w-6 text-gray-700 dark:text-gray-100" />
//         </button>
//         <nav className="flex flex-col gap-2 mt-16 px-6">
//           {navItems.map((item) => (
//             <React.Fragment key={item.to}>
//               <div className="flex items-center">
//                 <Link
//                   to={item.to}
//                   className="flex items-center gap-3 py-3 text-lg font-semibold text-gray-700 dark:text-gray-100 hover:text-[var(--accent-teal,#1de9b6)] rounded-full px-3 transition-colors flex-1"
//                   onClick={onClose}
//                 >
//                   {item.icon(theme)} {item.label}
//                 </Link>
//                 {/* Dropdown triggers for Solutions, Resources, and Support */}
//                 {item.label === 'Solutions' && (
//                   <button
//                     type="button"
//                     className="ml-2 p-1 rounded-full hover:bg-[rgba(29,233,182,0.08)]"
//                     onClick={e => { e.stopPropagation(); e.preventDefault(); setSolutionsOpen(v => !v); }}
//                     aria-label="Toggle solutions dropdown"
//                   >
//                     <ChevronDown className={`h-5 w-5 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
//                   </button>
//                 )}
//                 {item.label === 'Resources' && (
//                   <button
//                     type="button"
//                     className="ml-2 p-1 rounded-full hover:bg-[rgba(29,233,182,0.08)]"
//                     onClick={e => { e.stopPropagation(); e.preventDefault(); setResourcesOpen(v => !v); }}
//                     aria-label="Toggle resources dropdown"
//                   >
//                     <ChevronDown className={`h-5 w-5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
//                   </button>
//                 )}
//                 {item.label === 'Support' && (
//                   <button
//                     type="button"
//                     className="ml-2 p-1 rounded-full hover:bg-[rgba(29,233,182,0.08)]"
//                     onClick={e => { e.stopPropagation(); e.preventDefault(); setSupportOpen(v => !v); }}
//                     aria-label="Toggle support dropdown"
//                   >
//                     <ChevronDown className={`h-5 w-5 transition-transform ${supportOpen ? 'rotate-180' : ''}`} />
//                   </button>
//                 )}
//               </div>
//               {/* Solutions dropdown */}
//               {item.label === 'Solutions' && solutionsOpen && (
//                 <div className="ml-8 flex flex-col gap-1 mt-1 mb-2">
//                   {solutionServices.map((service) => (
//                     <Link
//                       key={service.label}
//                       to={service.to}
//                       className="text-[15px] font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--accent-teal,#1de9b6)] py-1 px-2 rounded transition-colors hover:bg-[rgba(29,233,182,0.08)]"
//                       onClick={onClose}
//                     >
//                       {service.label}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//               {/* Resources dropdown */}
//               {item.label === 'Resources' && resourcesOpen && (
//                 <div className="ml-8 flex flex-col gap-1 mt-1 mb-2">
//                   {resourceLinks.map((resource) => (
//                     <Link
//                       key={resource.label}
//                       to={resource.to}
//                       className="text-[15px] font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--accent-teal,#1de9b6)] py-1 px-2 rounded transition-colors hover:bg-[rgba(29,233,182,0.08)]"
//                       onClick={onClose}
//                     >
//                       {resource.label}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//               {/* Support dropdown */}
//               {item.label === 'Support' && supportOpen && (
//                 <div className="ml-8 flex flex-col gap-1 mt-1 mb-2">
//                   {supportLinks.map((support) => (
//                     <Link
//                       key={support.label}
//                       to={support.to}
//                       className="text-[15px] font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--accent-teal,#1de9b6)] py-1 px-2 rounded transition-colors hover:bg-[rgba(29,233,182,0.08)]"
//                       onClick={onClose}
//                     >
//                       {support.label}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </React.Fragment>
//           ))}
//         </nav>
//       </div>
//       <div className="flex-1" onClick={onClose} />
//     </div>
//   );
// };

// export default HomeSidebar;
