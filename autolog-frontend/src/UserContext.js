import React, { createContext, useState, useContext } from "react";

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    isLoggedIn: false,
  });

  const login = (username, email) => {
    setUser({ username, email, isLoggedIn: true });
  };

  const logout = () => {
    setUser({ username: "", email: "", isLoggedIn: false });
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easier usage
export const useUser = () => useContext(UserContext);
