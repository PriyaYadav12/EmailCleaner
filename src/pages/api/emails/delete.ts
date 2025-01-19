import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken, emailIds } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required" });
  }

  if (!emailIds || !Array.isArray(emailIds)) {
    return res.status(400).json({ error: "Valid email IDs are required" });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken as string });
  const gmail = google.gmail({ version: "v1", auth });
  const tokenInfo = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
    
    // Check if the token has the required scope (gmail.modify in this case)
    const requiredScope = "https://www.googleapis.com/auth/gmail.modify";
    if (!tokenInfo.data.scope.includes(requiredScope)) {
      return res.status(403).json({ error: `Access token does not have the required scope: ${requiredScope}` });
    }

  try {
    await Promise.all(
      emailIds.map(async (emailId) => {
        await gmail.users.messages.delete({
          userId: "me",
          id: emailId,
        });
      })
    );

    res.status(200).json({ message: "Emails deleted successfully" });
  } catch (error) {
    console.error("Error deleting emails:", error);
    res.status(500).json({ error: "Failed to delete emails" });
  }
}
