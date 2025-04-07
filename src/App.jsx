import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Contact } from "./components/contact";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";
import ChatBot from './components/ChatBot';
import ChatBotButton from './components/ChatBotButton';
import styled from 'styled-components';

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      <Navigation />
      <Header data={landingPageData.Header} />
      <features data={landingPageData.features} />
      <ChatContainer>
      {/* Contenu principal de votre site ici */}
      <h1>Contenu du site principal</h1>
      
      {/* Bouton du chatbot */}
      <ChatBotButton onClick={toggleChat} />
      
      {/* Fenêtre du chatbot */}
      {isChatOpen && <ChatBot onClose={toggleChat} />}
    </ChatContainer>
      <About data={landingPageData.About} />
      <Services data={landingPageData.Services} />
      <Contact data={landingPageData.Contact} />
    </div>
  );
}
const ChatContainer = styled.div`
  position: relative;
  min-height: 100vh;
`;



export default App;
