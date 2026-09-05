import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface NavigationContextType {
  currentPage: string;
  isLoading: boolean;
  navigateTo: (page: string) => void;
  setLoading: (loading: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  const navigateTo = (page: string) => {
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
    }, 800); // 800ms de loading para simular carga de datos
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, isLoading, navigateTo, setLoading }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
