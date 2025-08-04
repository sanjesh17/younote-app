import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./talk.css";
import ReactMarkdown from "react-markdown";

const Talk = () => {
  const location = useLocation();
  const { content } = location.state || {};
  const [messages, setMessages] = useState([
    {
      text: "Welcome to YouNote Chat! How can I assist you with your notes today?",
      user: "Assistant",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const textareaRef = useRef(null);

  // OpenRouter API configuration
  const openRouterApiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
  const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

  const predefinedPrompts = [
    "Give me question and answers for this",
    "Explain this in simple words",
    "Give me MCQ's for this",
  ];

  const generateResponseWithOpenRouter = async (userQuestion) => {
    const prompt = `The notes are: ${content}, answer strictly only if the questions are in the context of the notes(do not deviate from the genre), if not do not display any statements, just give the answer for the question. Use Markdown formatting in your response: question: ${userQuestion}.`;

    try {
      const response = await axios.post(
        openRouterUrl,
        {
          model: "meta-llama/llama-4-maverick", // You can change this to any OpenRouter model
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin, // Optional: for analytics
            "X-Title": "YouNote AI Chat", // Optional: for analytics
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating response with OpenRouter:", error);
      throw error;
    }
  };

  const handleSendMessage = useCallback(
    async (text) => {
      if (text.trim() !== "") {
        const newMessage = { text, user: "Me" };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
          const response = await generateResponseWithOpenRouter(text);
          const aiMessage = { text: response, user: "Assistant" };
          setMessages((prevMessages) => [...prevMessages, aiMessage]);
        } catch (error) {
          console.error("Error generating AI response:", error);
          const errorMessage = {
            text: "Sorry, I encountered an error while processing your request. Please try again.",
            user: "Assistant",
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }
    },
    [content, openRouterApiKey]
  );

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const adjustTextareaHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    adjustTextareaHeight();
    window.addEventListener("resize", adjustTextareaHeight);

    return () => {
      window.removeEventListener("resize", adjustTextareaHeight);
    };
  }, [inputValue]);

  if (!openRouterApiKey) {
    console.error("OpenRouter API key is missing!");
    return (
      <div className="error-message">
        OpenRouter API key is missing. Please check your configuration.
      </div>
    );
  }

  return (
    <div className="claude-container">
      <div className="chat-header">
        <h1>YouNote Chat (Powered by OpenRouter AI)</h1>
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.user === "Assistant"
                ? "assistant-message"
                : "human-message"
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
              <p className="typing-indicator">
                Typing<span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="send-icon"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
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
