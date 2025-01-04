"use client";

import React, { useState, useEffect } from "react";
import SettingsTab from "./settings-tab";
import ContentManager from "./contentmanager";
import { supabase } from "../../src/app/supabaseClient";

function DataroomManager({ dataroomName, dataroomId }) {
  const [lockAll, setLockAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch the initial lock state
  useEffect(() => {
    const fetchLockState = async () => {
      if (!dataroomId) return;

      try {
        const { data, error } = await supabase
          .from("datarooms")
          .select("files_locked")
          .eq("id", dataroomId)
          .single();

        if (error) {
          console.error("Error fetching lock state:", error.message);
        } else {
          setLockAll(data?.files_locked || false);
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };

    fetchLockState();
  }, [dataroomId]);

  // Toggle lock state
  const handleToggleLockAll = async () => {
    setLoading(true);
    try {
      const newLockState = !lockAll;

      const { error } = await supabase
        .from("datarooms")
        .update({ files_locked: newLockState })
        .eq("id", dataroomId);

      if (error) throw error;

      setLockAll(newLockState);
    } catch (err) {
      console.error("Error toggling lock state:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsTab
        dataroomName={dataroomName}
        dataroomId={dataroomId}
        lockAll={lockAll}
        loading={loading}
        onToggleLockAll={handleToggleLockAll}
      />
      <ContentManager
        dataroomId={dataroomId}
        lockAll={lockAll}
        onToggleLockAll={handleToggleLockAll}
      />
    </div>
  );
}

export default DataroomManager;
