import React, { useEffect, useMemo, useState } from 'react';
import { deleteRecording, getRecordings } from '../api/recordings';
import RecordingCard from '../components/RecordingCard';

export default function Home() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRecordings = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getRecordings();
      setRecordings(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error('Failed to load recordings:', fetchError);
      setError('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const handleDeleteRecording = async (id) => {
    await deleteRecording(id);
    setRecordings((currentRecordings) =>
      currentRecordings.filter((recording) => recording._id !== id),
    );
  };

  const visibleRecordings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...recordings]
      .filter((recording) =>
        normalizedSearch.length === 0 || recording.fileName.toLowerCase().includes(normalizedSearch),
      )
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  }, [recordings, searchTerm]);

  let pageContent;

  if (loading) {
    pageContent = <div className="state-panel">Loading recordings...</div>;
  } else if (error) {
    pageContent = <div className="state-panel state-panel--error">{error}</div>;
  } else if (visibleRecordings.length === 0) {
    pageContent = <div className="state-panel">No recordings found</div>;
  } else {
    pageContent = (
      <div className="recording-list">
        {visibleRecordings.map((recording) => (
          <RecordingCard
            key={recording._id}
            recording={recording}
            onDelete={handleDeleteRecording}
          />
        ))}
      </div>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="hero__eyebrow">Audio dashboard</p>
          <h1 className="hero__title">Audio Recordings</h1>
          <p className="hero__subtitle">
            Browse uploaded recordings, preview them in the browser, and review key metadata.
          </p>
        </div>

        <div className="hero__controls">
          <label className="search-box" htmlFor="recording-search">
            <span className="search-box__label">Search by filename</span>
            <input
              id="recording-search"
              className="search-box__input"
              type="search"
              placeholder="mic_123.amr"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <button className="refresh-button" type="button" onClick={loadRecordings}>
            Refresh
          </button>
        </div>
      </section>

      {pageContent}
    </main>
  );
}
