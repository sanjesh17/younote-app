import React, { useState } from "react";
import axios from "axios";
import "./generate.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import withFadeInFromBottom from "../HOC/withFadeInFromBottom";

const Generate = () => {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);

  const fetchTranscript = async (videoID) => {
    const vercelApiUrl = `https://youtube-transcript-backend-eight.vercel.app/api/transcript?videoId=${videoID}`;

    try {
      const response = await axios.get(vercelApiUrl);
      setTranscript(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error("Error fetching transcript:", error);
      return null;
    }
  };

  const getYouTubeVideoId = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const run = async () => {
    const videoID = getYouTubeVideoId(url);
    if (!videoID) {
      console.error("Invalid YouTube URL");
      return;
    }

    const transcriptData = await fetchTranscript(videoID);
    if (!transcriptData) {
      console.error("No transcript available");
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Provide a long and multi-topic summary of the following YouTube video transcription. Include key points, main arguments, and overall message. Construct it so that people could use this as notes and read from them, use appropriate references if applied, and provide a complete note to study and use in the future with perfect real-time examples if possible:

    ${JSON.stringify(transcriptData)}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      console.log(response);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  return (
    <div className="gen-container">
      <div className="gen-content">
        <div className="gen-content-container">
          <h1 className="head-text-gen">Get Your Videos</h1>
          <h3 className="head-text-gen-2">Converted to Notes</h3>
        </div>
        <div className="drop-container">
          <input
            type="text"
            placeholder="Paste The Link Here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="button" onClick={run}>
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default withFadeInFromBottom(Generate);
