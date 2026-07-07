import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { JournalForm } from "./journal/JournalForm";
import { JournalList } from "./journal/JournalList";
import { JournalDetailModal } from "./journal/JournalDetailModal";
import { Sidebar } from "./layout/Sidebar";
import { WarmthGauge } from "./WarmthGauge";
import styles from "./Home.module.css";

export const Home = ({ onLogout }) => {
  const [entries, setEntries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const getAllEntries = async () => {
    const response = await axios.get("/entries");
    setEntries(response.data);
  };

  const handleNewEntry = (newEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
  };

  useEffect(() => {
    getAllEntries();
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar onLogout={onLogout} />
      <div className={styles.content}>
        <div className={styles.hero}>
          <p className={styles.heroTitle}>오늘, 마음에 걸리는 일이 있었나요</p>
          <p className={styles.heroSub}>
            내려놓을 것과 내가 쥘 것을, 천천히 나눠봐요
          </p>
        </div>

        <WarmthGauge />
        <JournalForm onSubmitSuccess={handleNewEntry} />
        <JournalList entries={entries} onSelect={setSelectedId} />
      </div>

      {selectedId && (
        <JournalDetailModal
          entryId={selectedId}
          onClose={() => setSelectedId(null)}
          onStartConversation={(id) => navigate(`/entries/${id}/conversation`)}
        />
      )}
    </div>
  );
};
