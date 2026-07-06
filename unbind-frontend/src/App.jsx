import { useEffect, useState } from "react";
import { Login } from "./components/auth/Login";
import axios from "./api/axiosInstance";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setEntries([]);
  };

  const getAllEntries = async () => {
    const response = await axios.get("/entries");
    setEntries(response.data);
  };

  useEffect(() => {
    console.log(`token = ${token}`);
    if (token) {
      getAllEntries();
    }
  }, [token]);

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  return (
    <div>
      <button onClick={handleLogout}>로그아웃</button>
      <ul>
        {entries.map((item) => (
          <li key={item.id}>{item.situationText}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
