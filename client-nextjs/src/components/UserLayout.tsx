
// 'use client';

// import { useState } from 'react';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import Chatbot from '@/components/user/Chatbot';
// import { motion } from 'framer-motion';

// interface UserLayoutProps {
//   children: React.ReactNode;
// }

// const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
//   const [profileOpen, setProfileOpen] = useState(false);

//   const handleLogout = () => {
//     localStorage.removeItem('userSession');
//     window.location.href = '/handler/sign-out';
//   };

//   return (
//     <div className="min-h-screen w-full flex bg-slate-950">
//       <div className="flex-1 min-h-screen ml-[260px] relative">
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="absolute top-6 right-10 z-40"
//           onMouseEnter={() => setProfileOpen(true)}
//           onMouseLeave={() => setProfileOpen(false)}
//         >
//           <Avatar>
//             <AvatarFallback className="bg-cyan-600 text-white font-bold text-lg">
//               U
//             </AvatarFallback>
//           </Avatar>
//           {profileOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-2 px-4 flex flex-col items-start border border-gray-700 z-50"
//             >
//               <div className="text-gray-100 font-semibold mb-2">User</div>
//               <button
//                 className="w-full text-left text-red-400 font-bold py-1 px-2 rounded hover:bg-red-900/50 transition"
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             </motion.div>
//           )}
//         </motion.div>
//         <main className="max-w-5xl mx-auto pt-4 pb-8">{children}</main>
//       </div>
//       <Chatbot />
//     </div>
//   );
// };

// export default UserLayout;
