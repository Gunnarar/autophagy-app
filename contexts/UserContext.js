import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await loadJSON('userProfile', null);
      if (storedUser) setUser(storedUser);
      setLoading(false);
    })();
  }, []);

  const saveUser = async (userData) => {
    setUser(userData);
    await saveJSON('userProfile', userData);
  };

  return (
    <UserContext.Provider value={{ user, saveUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 
