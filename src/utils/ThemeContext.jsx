import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  currentTheme: 'light',
  changeCurrentTheme: () => {},
});

export default function ThemeProvider({children}) {  
  // Forcer le thème light en permanence
  const [theme, setTheme] = useState('light');

  const changeCurrentTheme = (newTheme) => {
    // Ignorer tout changement de thème, rester toujours sur light
    console.log('Dark mode désactivé - thème forcé en light');
  };

  useEffect(() => {
    // S'assurer que le dark mode est toujours désactivé
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    
    // Optionnel : supprimer toute transition
    document.documentElement.classList.add('**:transition-none!');
    
    const transitionTimeout = setTimeout(() => {
      document.documentElement.classList.remove('**:transition-none!');
    }, 1);
    
    return () => clearTimeout(transitionTimeout);
  }, []); // Tableau de dépendances vide = exécuté une seule fois

  return <ThemeContext.Provider value={{ currentTheme: theme, changeCurrentTheme }}>{children}</ThemeContext.Provider>;
}

export const useThemeProvider = () => useContext(ThemeContext);