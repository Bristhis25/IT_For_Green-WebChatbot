import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(false);

  // Questions et options prédéfinies
  const questions = [
    {
      id: 'welcome',
      text: "Bonjour, je suis l'assistant IA du site Skill4Mind, je suis là pour vous aider à trouver la formation idéale pour vos besoin. Commençons quel type de formation voulez-vous ?",
      options: ['Distanciel', 'Hybride'],
      inputAllowed: false
    },
    {
      id: 'experience',
      text: "Avez-vous déjà une expérience dans ce domaine ?",
      options: ['Débutant', 'Intermédiaire', 'Avancé'],
      inputAllowed: false
    },
    {
      id: 'goals',
      text: "Quels sont vos objectifs spécifiques pour cette formation ?",
      options: [],
      inputAllowed: true
    }
    // Ajoutez d'autres questions selon vos besoins
  ];

  // Initialisation du chat
  useEffect(() => {
    // Afficher la première question au démarrage
    askQuestion('welcome');
  }, []);

  const askQuestion = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setMessages(prev => [...prev, { type: 'bot', text: question.text }]);
      setCurrentQuestion(question);
      setInputDisabled(!question.inputAllowed);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    
    // Logique pour déterminer la prochaine question
    // Simplifié pour l'exemple
    if (currentQuestion.id === 'goals') {
      setTimeout(() => askQuestion('experience'), 1000);
    }
    
    setInputValue('');
  };

  const handleOptionClick = (option) => {
    // Ajouter la réponse de l'utilisateur
    setMessages(prev => [...prev, { type: 'user', text: option }]);
    
    // Logique pour déterminer la prochaine question
    // Simplifié pour l'exemple
    if (currentQuestion.id === 'welcome') {
      setTimeout(() => askQuestion('goals'), 1000);
    } else if (currentQuestion.id === 'experience') {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Merci pour vos réponses ! Je vais vous proposer des formations adaptées à votre profil." 
        }]);
      }, 1000);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        
        <HeaderTitle>ChatBot IA</HeaderTitle>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.type === 'user'}>
            {message.text}
          </MessageBubble>
        ))}
        
        {currentQuestion && currentQuestion.options.length > 0 && (
          <OptionsContainer>
            {currentQuestion.options.map((option, index) => (
              <OptionButton 
                key={index} 
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        )}
      </MessagesContainer>
      
      <ChatInputContainer>
        <ChatInput 
          placeholder="Type your message here..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={inputDisabled}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <SendButton onClick={handleSendMessage}>
          <SendIcon>➤</SendIcon>
        </SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

// Styles
const ChatContainer = styled.div`
  position: fixed;
  bottom: 90px;
  left: 20px;
  width: 350px;
  height: 550px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  background-color: #20B2AA;
  padding: 15px;
  color: white;
`;

const HeaderAvatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 10px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  flex-grow: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isUser ? '#e6e6e6' : '#20B2AA'};
  color: ${props => props.isUser ? 'black' : 'white'};
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const OptionButton = styled.button`
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 15px;
  background-color: #f0f0f0;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #20B2AA;
  color: white;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const SendIcon = styled.span`
  
`;

export default ChatBot;
