// src/lib/auth/use-enterprise-logout.ts
'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@stackframe/stack'
import { AUTH_CONFIG } from './stack-config'

export function useEnterpriseLogout() {
  const user = useUser()
  const queryClient = useQueryClient()

  return async function enterpriseLogout() {
    // ✅ NULL CHECK: Only proceed if user exists
    if (!user) {
      console.warn('Logout called but no user found')
      // Still clear storage and redirect
      window.location.href = AUTH_CONFIG.POST_LOGOUT_URL
      return
    }

    try {
      // Clear ALL storage
      const clearAllStorage = () => {
        localStorage.clear()
        sessionStorage.clear()
        
        // Delete all cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.split('=')
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        })
        
        // ✅ FIXED: Filter out databases without names
        if (indexedDB.databases) {
          indexedDB.databases().then(dbs => {
            dbs?.forEach(db => {
              if (db.name) { // ✅ Type guard
                indexedDB.deleteDatabase(db.name)
              }
            })
          })
        }
      }

      // Clear React Query cache
      queryClient.clear()
      
      // Clear storage
      clearAllStorage()

      // ✅ SAFE: Now user is not null
      await user.signOut({
        redirectUrl: AUTH_CONFIG.POST_LOGOUT_URL,
      })

      // Safety redirect
      setTimeout(() => {
        window.location.href = AUTH_CONFIG.POST_LOGOUT_URL
      }, 500)
    } catch (error) {
      console.error('Logout failed, forcing redirect:', error)
      window.location.href = AUTH_CONFIG.POST_LOGOUT_URL
    }
  }
}