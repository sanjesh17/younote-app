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
import { Link, useNavigate } from "react-router-dom";

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
        <Text style={styles.title}>YouNote AI Notes</Text>
        <Text style={styles.content}>{content}</Text>
        <br />
        <Text style={styles.footer}>
          This PDF was generated by YouNote Notes Generator
        </Text>
      </View>
    </Page>
  </Document>
);

const Generate = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [success, setSuccess] = useState(false);

  const cleanText = (text) => {
    return text.replace(/[#*_~`]/g, "").replace(/\n{3,}/g, "\n\n").trim();
  };

  const apiKey = process.env.REACT_APP_API_KEY;
  if (!apiKey) {
    console.error("API key is missing!");
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const getYouTubeVideoId = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchSubtitles = async (videoID) => {
    try {
      const response = await axios.get(`https://younote-python.onrender.com/api/subtitles`, {
        params: { videoID },
      });
      return response.data.subtitles.map((caption) => caption.text).join(" ");
    } catch (error) {
      console.error("Error fetching subtitles:", error);
      return null;
    }
  };

  const run = async () => {
    setLoading(true);
    const videoID = getYouTubeVideoId(url);
    if (!videoID) {
      console.error("Invalid YouTube URL");
      setLoading(false);
      return;
    }
    const subtitles = await fetchSubtitles(videoID);
    if (!subtitles) {
      console.error("No subtitles available");
      setLoading(false);
      return;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Provide a long and multi-topic summary of the following YouTube video subtitles. Include key points, main arguments, important external references, and overall message. Construct it so that people could use this as notes and read from them, providing complete notes to study and use in the future with perfect real-time examples if possible:
    ${subtitles}`;
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

  const handleTalkToPDF = () => {
    navigate("/talktopdf", { state: { content: generatedContent } });
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
              fileName="YouNote_AI_Notes.pdf"
            >
              {({ loading }) =>
                loading ? (
                  "Preparing PDF..."
                ) : (
                  <div className="download-container">
                    <button className="download-btn">Download PDF</button>
                  </div>
                )
              }
            </PDFDownloadLink>
            <button className="talk-btn" onClick={handleTalkToPDF}>
              Talk To This PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default withFadeInFromBottom(Generate);
