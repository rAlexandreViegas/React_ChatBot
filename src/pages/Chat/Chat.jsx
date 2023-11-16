import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState();

  async function formSubmit() {
    setChatResponse("");

    try {
      const response = await fetch(OPENAI_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            import.meta.env.VITE_REACT_APP_OPENAI_API_KEY
          }`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          model: "gpt-3.5-turbo",
        }),
      });
      if (!response.ok) {
        console.error(response.status);
      }
      const data = await response.json();

      if (data) {
        const chatResponseContent = data.choices[0].message.content;

        const lowerCaseSubject = formData.subject.toLowerCase();
        const lowerCaseChatResponse = chatResponseContent.toLowerCase();

        const cleanSubject = lowerCaseSubject.replace(/[^\w\s]/g, "");
        const cleanChatResponse = lowerCaseChatResponse.replace(/[^\w\s]/g, "");

        if (cleanChatResponse.includes(cleanSubject)) {
          const personalizedResponse = `Bonjour ${formData.name}, ${chatResponseContent}`;
          setChatResponse(personalizedResponse);
        } else {
          setChatResponse(
            `Désolé ${formData.name}, je ne peux pas répondre à cette question.`
          );
        }
      }
    } catch (error) {
      console.error(error);
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
