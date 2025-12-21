// src/components/EnterpriseLoadingScreen.tsx
'use client'

import { motion } from 'framer-motion'

export function EnterpriseLoadingScreen({ 
  message = 'Loading', 
  subtext 
}: { message?: string; subtext?: string }) {
  return (
    <div className="fixed inset-0 bg-cockpit-bg flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="relative mx-auto mb-8 w-20 h-20"
        >
          <div className="absolute inset-0 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full" style={{ animation: 'spin 1.5s linear infinite' }}></div>
          <div className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
        </motion.div>
        
        <h2 className="text-3xl font-bold text-cyan-400 tracking-wide">
          {message}
        </h2>
        
        {subtext && (
          <p className="text-gray-400 mt-2 text-lg">{subtext}</p>
        )}
      </div>
    </div>
  )
}