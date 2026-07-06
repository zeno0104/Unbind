import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/auth/Login";
import { SignUp } from "./components/auth/SignUp";
import { Home } from "./components/Home";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/" />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/"
        element={
          token ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
