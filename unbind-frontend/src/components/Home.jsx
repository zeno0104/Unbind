import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export const Home = ({ onLogout }) => {
  const [entries, setEntries] = useState([]);

  const getAllEntries = async () => {
    const response = await axios.get("/entries");
    setEntries(response.data);
  };

  useEffect(() => {
    getAllEntries();
  }, []);

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      <ul>
        {entries.map((item) => (
          <li key={item.id}>{item.situationText}</li>
        ))}
      </ul>
    </div>
  );
};
