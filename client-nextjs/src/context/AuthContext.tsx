// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useUser } from "@stackframe/stack";

// interface AuthContextType {
//   user: any;
//   isAdmin: boolean;
//   loading: boolean;
//   // add more app-specific auth state here
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const neonUser = useUser();
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Example: extend neonUser with roles from your backend API
//   useEffect(() => {
//     async function fetchUserRole() {
//       if (neonUser?.id) {
//         // Fetch from your NestJS API: `/api/user-role?id=${neonUser.id}`
//         // For demo, assume admin if email includes 'admin'
//         setIsAdmin(neonUser.primaryEmail?.includes("admin") ?? false);
//       }
//       setLoading(false);
//     }
//     fetchUserRole();
//   }, [neonUser]);

//   return (
//     <AuthContext.Provider value={{ user: neonUser, isAdmin, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };
