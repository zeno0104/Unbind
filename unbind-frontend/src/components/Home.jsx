import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { JournalForm } from "./journal/JournalForm";
import { JournalList } from "./journal/JournalList";
import { Sidebar } from "./layout/Sidebar";
import styles from "./Home.module.css";

export const Home = ({ onLogout }) => {
  const [entries, setEntries] = useState([]);

  const getAllEntries = async () => {
    const response = await axios.get("/entries");
    setEntries(response.data);
  };
  const handleNewEntry = (newEntry) => {
    setEntries([newEntry, ...entries]);
  };
  useEffect(() => {
    getAllEntries();
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar onLogout={onLogout} />
      <div className={styles.content}>
        <JournalForm onSubmitSuccess={handleNewEntry} />
        <JournalList entries={entries} />
      </div>
    </div>
  );
};
