import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const getAllEntries = async () => {
    const response = await axios("http://localhost:80/entries");
    setEntries(response.data);
  };
  useEffect(() => {
    getAllEntries();
  }, []);
  return (
    <div>
      <ul>
        {entries.map((item, index) => (
          <li key={index}>{item.situationText}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
