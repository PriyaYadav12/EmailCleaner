import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken, category, pageToken } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required" });
  }

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "Valid category is required" });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken as string });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: [category], // Use the category as labelId
      maxResults: 10,
      pageToken: pageToken as string | undefined,
    });
    const messages = response.data.messages || [];
    const emailDetails = await Promise.all(
      messages.map(async (message) => {
        if (message.id) {
          const msg = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });
          return msg.data;
        }
        return null;
      })
    );

    res.status(200).json({ emails: emailDetails, nextPageToken: response.data.nextPageToken });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
}