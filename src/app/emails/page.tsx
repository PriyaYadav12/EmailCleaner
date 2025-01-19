"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import axios from "axios";
import Link from "next/link";

interface EmailHeader {
  name: string;
  value: string;
}

interface Email {
  id: string;
  payload?: {
    headers?: EmailHeader[];
  };
}

export default function EmailsPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("CATEGORY_PERSONAL");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [signingIn, setSigningIn] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setEmails([]); // Clear emails when switching tabs
      setLoading(true); // Show loading immediately
      fetchEmails(selectedTab);
    }
  }, [session, selectedTab]);

  const fetchEmails = async (category: string, pageToken: string | null = null) => {
    if (!session?.accessToken) {
      alert("No access token found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/emails/fetch`, {
        params: { accessToken: session.accessToken, category: category, pageToken },
      });
      setEmails((prevEmails) => [...prevEmails, ...response.data.emails]);
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error: any) {
      console.error("Error fetching emails:", error.response?.data || error.message);
      if (session.error === "RefreshAccessTokenError") {
        signIn(); // Force sign-in to get a new token
      } else {
        alert("Failed to fetch emails. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuspiciousEmail = (email: Email) => {
    const fromHeader = email.payload?.headers?.find((h) => h.name === "From")?.value || "";
    const subjectHeader = email.payload?.headers?.find((h) => h.name === "Subject")?.value || "";
    const spamKeywords = ["win", "offer", "lottery", "free", "discount"];
    const suspiciousSenders = ["promo", "newsletter", "offer"];
    return (
      fromHeader.includes("suspicious.com") ||
      spamKeywords.some((keyword) => subjectHeader.toLowerCase().includes(keyword)) ||
      suspiciousSenders.some((sender) => fromHeader.toLowerCase().includes(sender))
    );
  };

  const handleCheckboxChange = (emailId: string) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(emailId)
        ? prevSelected.filter((id) => id !== emailId)
        : [...prevSelected, emailId]
    );
  };

  const deleteSelectedEmails = async () => {
    try {
      await axios.post(`/api/emails/delete`, {
        accessToken: session?.accessToken,
        emailIds: selectedEmails,
      });
      setEmails((prevEmails) => prevEmails.filter((email) => !selectedEmails.includes(email.id)));
      setSelectedEmails([]);
    } catch (error) {
      console.error("Error deleting emails:", error);
      alert("Failed to delete emails. Please try again.");
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Emails</h1>
      {!session ? (
        <button
          onClick={() => {
            setSigningIn(true);
            signIn("google").finally(() => setSigningIn(false));
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          disabled={signingIn}
        >
          {signingIn ? "Signing in..." : "Login with Google"}
        </button>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={() => setSelectedTab("CATEGORY_PERSONAL")}
              className={`px-4 py-2 mx-2 rounded ${selectedTab === "CATEGORY_PERSONAL" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              disabled={loading}
            >
              Inbox
            </button>
            <button
              onClick={() => setSelectedTab("CATEGORY_PROMOTIONS")}
              className={`px-4 py-2 mx-2 rounded ${selectedTab === "CATEGORY_PROMOTIONS" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              disabled={loading}
            >
              Promotion
            </button>
            <button
              onClick={() => setSelectedTab("CATEGORY_SOCIAL")}
              className={`px-4 py-2 mx-2 rounded ${selectedTab === "CATEGORY_SOCIAL" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              disabled={loading}
            >
              Social
            </button>
            <button
              onClick={() => setSelectedTab("SPAM")}
              className={`px-4 py-2 mx-2 rounded ${selectedTab === "SPAM" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              disabled={loading}
            >
              Spam
            </button>
          </div>
          {loading && <p>Loading emails...</p>}
          {emails.length > 0 && (
            <>
              <button
                onClick={deleteSelectedEmails}
                className={`${
                  selectedEmails.length === 0 ? "bg-red-300" : "bg-red-500"
                } text-white px-4 py-2 rounded mb-4`}
                disabled={selectedEmails.length === 0}
              >
                Delete Selected Emails
              </button>
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li
                    key={email.id}
                    className={`border p-2 rounded ${isSuspiciousEmail(email) ? "bg-red-100" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={() => handleCheckboxChange(email.id)}
                      className="mr-2"
                    />
                    <p>
                      <strong>From:</strong>{" "}
                      {email.payload?.headers?.find((h) => h.name === "From")?.value || "Unknown"}
                    </p>
                    <p>
                      <strong>Subject:</strong>{" "}
                      {email.payload?.headers?.find((h) => h.name === "Subject")?.value || "No Subject"}
                    </p>
                  </li>
                ))}
              </ul>
              {nextPageToken && (
                <button
                  onClick={() => fetchEmails(selectedTab, nextPageToken)}
                  className="bg-blue-500 text-white mx-2 px-4 py-2 rounded mt-4"
                  disabled={loading}
                >
                  Load More
                </button>
              )}
            </>
          )}
        </>
      )}
      <Link href="/">
        <button className="bg-blue-500 text-white mx-2 px-4 py-2 rounded mt-4">
          Back to Home
        </button>
      </Link>
      {emails.length !== 0 && (
        <button onClick={() => signOut()} className="bg-blue-500 text-white mx-2 px-4 py-2 rounded mt-4">
          Sign Out
        </button>
      )}
    </div>
  );
}
