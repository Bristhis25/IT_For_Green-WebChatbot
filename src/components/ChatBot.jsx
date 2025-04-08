import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import intents from '../data/intent.json';
import avatarIcon from '../assets/img/learnia-avatar.png';
const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonction pour trouver la meilleure intention correspondante
  const findBestIntent = (message) => {
    const messageLower = message.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    intents.intents.forEach(intent => {
      intent.patterns.forEach(pattern => {
        if (messageLower.includes(pattern.toLowerCase())) {
          const score = pattern.length;
          if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
          }
        }
      });
    });

    return bestMatch;
  };

  // Fonction pour obtenir une réponse aléatoire d'une intention
  const getRandomResponse = (intent) => {
    const responses = intent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    
    // Trouver l'intention correspondante
    const intent = findBestIntent(inputValue);
    
    // Ajouter la réponse du bot
    setTimeout(() => {
      if (intent) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: getRandomResponse(intent)
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Je ne comprends pas bien votre demande. Pouvez-vous reformuler ?" 
        }]);
      }
    }, 1000);
    
    setInputValue('');
  };

  // Message de bienvenue initial
  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      setMessages([{ 
        type: 'bot', 
        text: "Bonjour ! Je suis l'assistant Learnia de Skill4Mind. Je peux vous aider à trouver la formation idéale, vous renseigner sur les tarifs et répondre à vos questions sur nos formations. Comment puis-je vous aider aujourd'hui ?" 
      }]);
      setIsInitialized(true);
    }
  }, [messages, isInitialized]);

  return (
    <ChatContainer>
      <ChatHeader>
      <HeaderAvatar src={avatarIcon} alt="ChatBot Avatar" />
        <HeaderTitle>ChatBot Learnia</HeaderTitle>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.type === 'user'}>
            {message.text}
          </MessageBubble>
        ))}
      </MessagesContainer>
      
      <ChatInputContainer>
        <ChatInput 
          placeholder="Tapez votre message ici..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
  background-color: #0e5c66;
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
  color: white;
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
  background-color: ${props => props.isUser ? '#e6e6e6' : '#0e5c66'};
  color: ${props => props.isUser ? 'black' : 'white'};
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
  background-color: #0e5c66;
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
