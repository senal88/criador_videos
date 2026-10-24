import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F2E9] flex flex-col items-center justify-center p-6 text-[#142419]">
        <div className="w-10 h-10 border-3 border-[#1F3D2B] border-t-[#C4704F] rounded-full animate-spin mb-4" />
        <p className="font-serif font-bold text-sm text-[#1F3D2B]">Carregando Aline Resolve...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
