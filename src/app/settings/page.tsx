"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, Download, Trash2, LogOut, ShieldAlert } from "lucide-react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      window.location.href = "/api/export";
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently erased.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "DELETE",
      });

      if (res.ok) {
        signOut({ callbackUrl: "/" });
      } else {
        alert("Failed to delete account. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Settings & Privacy</h1>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Download size={18} />
            Data Export
          </h2>
          <p className={styles.sectionDescription}>
            Download a complete copy of your personal data, including period logs, sleep data, mood history, and journal entries. Your data is provided in a secure JSON format.
          </p>
          <button 
            className={styles.button} 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Download My Data"}
          </button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <ShieldAlert size={18} />
            Account Management
          </h2>
          <p className={styles.sectionDescription}>
            Manage your active session or permanently delete your account. Deleting your account will erase all your personal data from our servers.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button 
              className={styles.button} 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </button>
            
            <button 
              className={`${styles.button} ${styles.dangerButton}`} 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting Account..." : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
