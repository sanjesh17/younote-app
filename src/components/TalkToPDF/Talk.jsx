import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./talk.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const Talk = () => {
  const location = useLocation();
  const { content } = location.state || {};
  const [messages, setMessages] = useState([{ text: "Welcome to YouNote Chat! How can I assist you with your notes today?", user: "Assistant" }]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textareaRef = useRef(null);

  const apiKey = process.env.REACT_APP_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const predefinedPrompts = [
    "Give me question and answers for this",
    "Explain this in simple words",
    "Give me MCQ's for this",
  ];

  const handleSendMessage = useCallback(async (text) => {
    if (text.trim() !== "") {
      const newMessage = { text, user: "Me" };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputValue("");
      setIsTyping(true);

      try {
        const prompt = `The notes are: ${content}, answer strictly only if the questions are in the context of the notes(do not deviate from the genre), if not do not display any statements, just give the answer for the question. Use Markdown formatting in your response: question: ${text}.`;
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        const aiMessage = { text: response, user: "Assistant" };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error generating AI response:", error);
      } finally {
        setIsTyping(false);
      }
    }
  }, [content, model]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const adjustTextareaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    adjustTextareaHeight();
    window.addEventListener('resize', adjustTextareaHeight);

    return () => {
      window.removeEventListener('resize', adjustTextareaHeight);
    };
  }, [inputValue]);

  if (!apiKey) {
    console.error("API key is missing!");
    return <div className="error-message">API key is missing. Please check your configuration.</div>;
  }

  return (
    <div className="claude-container">
      <div className="chat-header">
        <h1>YouNote Chat (Powered by Gemini AI)</h1>
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.user === "Assistant" ? "assistant-message" : "human-message"
            }`}
          >
            <div className="message-content">
              <strong className="user-label">{message.user}</strong>
              {message.user === "Assistant" ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message assistant-message">
            <div className="message-content">
              <strong className="user-label">Assistant</strong>
              <p className="typing-indicator">Typing<span>.</span><span>.</span><span>.</span></p>
            </div>
          </div>
        )}
      </div>
      <div className="input-container">
        <textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputValue);
            }
          }}
          className="input"
          rows={1}
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          className="send-button"
          disabled={!inputValue.trim() || isTyping}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="send-icon">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
      <div className="predefined-prompts">
        {predefinedPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(prompt)}
            className="predefined-prompt-button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Talk;
