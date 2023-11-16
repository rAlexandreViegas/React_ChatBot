import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import OpenAI from "openai";

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_REACT_APP_OPENAI_API_KEY,
});

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  async function formSubmit() {
    setChatResponse("");

    if (!message) {
      setChatResponse("Please do not leave the field blank.");
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Answer only if the subject is related to ${formData.subject}.
                      Use the language of the question.
                      Include the author's question (${formData.name}) in the response.`,
          },
          { role: "user", content: message },
        ],
        model: "gpt-3.5-turbo",
      });

      if (response.choices) {
        setChatResponse(response.choices[0].message.content);
      } else {
        setChatResponse("An unexpected response was received from the server.");
      }
    } catch (error) {
      console.error(error);
      setChatResponse(
        "An error occurred while processing your request. Please try again."
      );
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    await formSubmit();
  }

  function handleInputChange(e) {
    setMessage(e.target.value);
  }

  useEffect(() => {
    if (formData.name && formData.subject) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      navigate("/");
    }
  }, [formData, navigate]);

  if (!formData) {
    return null;
  }

  return (
    <main className="text-center">
      <h1 className="form-signin col-md-6 col-sm-10 m-auto mb-3">
        Bienvenue, {formData.name}
      </h1>
      <h3>Pose-moi tes questions sur {formData.subject}</h3>
      <form onSubmit={handleFormSubmit}>
        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            placeholder="Pose ta question ici"
            value={message}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <button className="btn  btn-warning rounded-pill" type="submit">
          Envoyer
        </button>
      </form>
      <p className="container mt-5 fs-5">{chatResponse}</p>
    </main>
  );
}

export default Chat;
