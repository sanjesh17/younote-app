import React, { useState } from "react";
import axios from "axios";
import "./generate.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import withFadeInFromBottom from "../HOC/withFadeInFromBottom";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#212121",
    padding: 30,
    color: "#FFFFFF",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 50,
    marginBottom: 10,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

const PDFDocument = ({ content }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>AI Generated Notes</Text>
        <Text style={styles.content}>{content}</Text>
      </View>
    </Page>
  </Document>
);

const Generate = () => {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [success, setSuccess] = useState(false);

  const cleanText = (text) => {
    return text
      .replace(/[#*_~`]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const apiKey = process.env.REACT_APP_API_KEY;
  if (!apiKey) {
    console.error("API key is missing!");
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);

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
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const run = async () => {
    setLoading(true);
    const videoID = getYouTubeVideoId(url);
    if (!videoID) {
      console.error("Invalid YouTube URL");
      setLoading(false);
      return;
    }
    const transcriptData = await fetchTranscript(videoID);
    if (!transcriptData) {
      console.error("No transcript available");
      setLoading(false);
      return;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Provide a long and multi-topic summary of the following YouTube video transcription. Include key points, main arguments, Important External References and overall message. Construct it so that people could use this as notes and read from them and provide a complete note to study and use in the future with perfect real-time examples if possible:
    ${JSON.stringify(transcriptData)}`;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      const formattedResponse = cleanText(response);
      setGeneratedContent(formattedResponse);
      setSuccess(true);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gen-container">
      <div className="gen-content">
        <div className="gen-content-container">
          {success ? (
            <h1 className="head-text-gen">Download Ready</h1>
          ) : (
            <h1 className="head-text-gen">Get Your Videos</h1>
          )}
          <h3 className="head-text-gen-2">Converted to Notes</h3>
        </div>
        <div className="drop-container">
          <input
            type="text"
            placeholder="Paste The Link Here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="button" onClick={run} disabled={loading}>
            {loading ? <div className="loader"></div> : "Generate"}
          </button>
        </div>
        {generatedContent && (
          <div className="download-section">
            <PDFDownloadLink
              document={<PDFDocument content={generatedContent} />}
              fileName="generated_notes.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  "Preparing PDF..."
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z" />
                  </svg>
                )
              }
            </PDFDownloadLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default withFadeInFromBottom(Generate);
