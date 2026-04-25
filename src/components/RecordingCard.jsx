/* eslint-disable react/prop-types, jsx-a11y/media-has-caption */
import React, { useEffect, useState } from "react";
import { getDownloadUrl } from "../api/recordings";

export default function RecordingCard({ recording, onDelete }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const fetchAudio = async () => {
      try {
        const url = await getDownloadUrl(recording._id);

        objectUrl = url;

        if (isMounted) {
          setAudioUrl(url);
        }
      } catch (err) {
        console.error("Audio Load Error:", err);
        if (isMounted) setError(true);
      }
    };

    fetchAudio();

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [recording._id]);

  const handleDelete = async () => {
    if (deleting) { 
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      if (typeof onDelete === "function") {
        await onDelete(recording._id);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      setDeleteError("Delete failed");
      setDeleting(false);
    }
  };

  let mediaContent;

  if (error) {
    mediaContent = <p style={{ color: "red" }}>Playback failed</p>;
  } else if (audioUrl) {
    mediaContent = (
      <audio
        className="recording-card__player"
        controls
        preload="metadata"
        src={audioUrl}
      />
    );
  } else {
    mediaContent = <p>Loading audio...</p>;
  }

  return (
    <article className="recording-card">
      <div className="recording-card__header">
        <div>
          <h2 className="recording-card__title">{recording.fileName}</h2>
          <p className="recording-card__meta">
            {(recording.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          className="refresh-button"
          type="button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {mediaContent}
      {deleteError ? <p style={{ color: "red" }}>{deleteError}</p> : null}
    </article>
  );
}