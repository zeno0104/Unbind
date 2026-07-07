import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/auth/Login";
import { SignUp } from "./components/auth/SignUp";
import { Home } from "./components/Home";
import { ConversationFlow } from "./pages/ConversationFlow";
import { JournalDetail } from "./pages/JournalDetail";
import { KnotRoom } from "./pages/KnotRoom";
import { PatternInsight } from "./pages/PatternInsight";
import { Calendar } from "./pages/Calendar";
import { RelationshipReport } from "./pages/RelationshipReport";

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
      <Route
        path="/entries/:entryId/conversation"
        element={token ? <ConversationFlow /> : <Navigate to="/login" />}
      />
      <Route
        path="/entries/:entryId/detail"
        element={token ? <JournalDetail /> : <Navigate to="/login" />}
      />
      <Route
        path="/room"
        element={token ? <KnotRoom /> : <Navigate to="/login" />}
      />
      <Route
        path="/insights"
        element={token ? <PatternInsight /> : <Navigate to="/login" />}
      />
      <Route
        path="/calendar"
        element={token ? <Calendar /> : <Navigate to="/login" />}
      />
      <Route
        path="/relationships"
        element={token ? <RelationshipReport /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
