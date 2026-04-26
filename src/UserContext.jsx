import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'aicrm_current_user';

const UserContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
});

export function UserProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id) setCurrentUserState(parsed);
      }
    } catch (_) {}
  }, []);

  const setCurrentUser = (user) => {
    setCurrentUserState(user);
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
