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
import { Onboarding } from "./pages/Onboarding";
import { Landing } from "./pages/Landing";
import { MyPage } from "./pages/MyPage";
import { Feedback } from "./pages/Feedback";
import { Forest } from "./pages/Forest";
import { OAuthCallback } from "./pages/OAuthCallback";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

const hasSeenOnboarding = () => localStorage.getItem("onboarding_done") === "1";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
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
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route
        path="/oauth/callback"
        element={<OAuthCallback onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/onboarding"
        element={token ? <Onboarding /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={
          !token ? (
            <Landing />
          ) : !hasSeenOnboarding() ? (
            <Navigate to="/onboarding" />
          ) : (
            <Home />
          )
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
      <Route
        path="/mypage"
        element={token ? <MyPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/feedback"
        element={token ? <Feedback /> : <Navigate to="/login" />}
      />
      <Route
        path="/forest"
        element={token ? <Forest /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
