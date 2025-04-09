import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import avatarIcon from '../assets/img/learnia-avatar.png';

// Constantes pour les styles
const COLORS = {
  primary: '#0e5c66',
  secondary: '#e6e6e6',
  text: {
    light: 'white',
    dark: 'black'
  }
};

const SIZES = {
  container: {
    minWidth: '300px',
    maxWidth: '800px',
    minHeight: '400px',
    maxHeight: '800px'
  }
};

// Fonctions utilitaires
const fetchAPI = async (endpoint, data) => {
  const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const isSpecialOption = (label) => ['Terminer', 'Autres'].includes(label);

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isQuestionnaire, setIsQuestionnaire] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState('default');

  // Fonction pour scroller automatiquement
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, options]);

  // Fonction utilitaire pour ajouter des messages
  const addMessage = (text, type = 'bot') => {
    setMessages(prev => [...prev, { type, text }]);
  };

  // Fonction utilitaire pour mettre à jour les options
  const updateOptions = (newOptions, newSelectedOptions = []) => {
    setOptions(newOptions || []);
    setSelectedOptions(newSelectedOptions || []);
    setIsQuestionnaire(!!newOptions);
  };

  // Fonction de gestion d'erreur centralisée
  const handleError = (error) => {
    console.error('Erreur:', error);
    addMessage("Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment.");
  };

  const startQuestionnaire = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await fetchAPI('chat', { message: 'start' });
      if (data.success) {
        addMessage(data.response);
        updateOptions(data.options);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Ajouter la sélection de l'utilisateur au chat
      addMessage(option.label, 'user');
      
      const data = await fetchAPI('chat', { message: option.label });
      
      if (data.success) {
        addMessage(data.response);
        if (data.is_questionnaire) {
          updateOptions(data.options, data.selected_options);
        } else {
          updateOptions([]);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    addMessage(message, 'user');
    setIsLoading(true);

    try {
      const data = await fetchAPI('chat', { message });
      
      if (data.success) {
        addMessage(data.response);
        if (data.is_questionnaire) {
          updateOptions(data.options, data.selected_options);
        } else {
          updateOptions([]);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      // Réinitialiser l'état local
      setMessages([]);
      setInputValue('');
      setOptions([]);
      setSelectedOptions([]);
      setIsQuestionnaire(false);

      // Appeler l'API pour réinitialiser la session et redémarrer le questionnaire
      const data = await fetchAPI('chat', { message: 'start' });
      
      if (data.success) {
        addMessage(data.response);
        if (data.is_questionnaire) {
          updateOptions(data.options);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({
      width: chatContainerRef.current.offsetWidth,
      height: chatContainerRef.current.offsetHeight
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    const newWidth = Math.max(300, Math.min(800, startSize.width + deltaX));
    const newHeight = Math.max(400, Math.min(800, startSize.height + deltaY));
    
    chatContainerRef.current.style.width = `${newWidth}px`;
    chatContainerRef.current.style.height = `${newHeight}px`;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const handleResize = (direction) => {
    const container = chatContainerRef.current;
    const currentWidth = container.offsetWidth;
    const currentHeight = container.offsetHeight;
    
    switch (direction) {
      case 'increase':
        container.style.width = `${Math.min(800, currentWidth + 100)}px`;
        container.style.height = `${Math.min(800, currentHeight + 100)}px`;
        break;
      case 'decrease':
        container.style.width = `${Math.max(300, currentWidth - 100)}px`;
        container.style.height = `${Math.max(400, currentHeight - 100)}px`;
        break;
      case 'reset':
        container.style.width = '400px';
        container.style.height = '600px';
        break;
      default:
        break;
    }
  };

  // Démarrer le questionnaire à l'ouverture
  useEffect(() => {
    startQuestionnaire();
  }, []);

  return (
    <ChatBotContainer ref={chatContainerRef}>
      <Header onMouseDown={handleMouseDown}>
        <HeaderAvatar src={avatarIcon} alt="ChatBot Avatar" />
        <Title>Chatbot Learnia</Title>
        <ResizeControls>
          <ResizeButton onClick={() => handleResize('decrease')} title="Réduire">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </ResizeButton>
          <ResizeButton onClick={() => handleResize('reset')} title="Taille par défaut">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
          </ResizeButton>
          <ResizeButton onClick={() => handleResize('increase')} title="Agrandir">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </ResizeButton>
        </ResizeControls>
        <ResetButton onClick={handleReset}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </ResetButton>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </Header>
      
      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.type === 'user'}>
            {message.text}
          </Message>
        ))}
        {isLoading && <Message>Chargement...</Message>}
        {isQuestionnaire && options.length > 0 && (
          <OptionsContainer>
            {options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleOptionSelect(option)}
                isSelected={selectedOptions.includes(option.label)}
                isSpecial={isSpecialOption(option.label)}
              >
                {option.label}
              </OptionButton>
            ))}
          </OptionsContainer>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
          placeholder="Écrivez votre message..."
          disabled={isQuestionnaire || isLoading}
        />
        <SendButton onClick={handleSendMessage} disabled={isQuestionnaire || isLoading}>
          <span>➤</span>
        </SendButton>
      </InputContainer>
    </ChatBotContainer>
  );
};

// Styles
const ChatBotContainer = styled.div`
  position: fixed;
  bottom: 100px;
  left: 20px;
  width: 400px;
  height: 600px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 300px;
  min-height: 400px;
  max-width: 800px;
  max-height: 800px;
  z-index: 1000;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  background-color: #0e5c66;
  padding: 15px;
  color: white;
  cursor: move;
  user-select: none;
`;

const HeaderAvatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  flex-grow: 1;
  color: white;
`;

const ResizeControls = styled.div`
  display: flex;
  gap: 5px;
  margin-right: 10px;
`;

const ResizeButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ResetButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #0e5c66;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background-color: #0a4850;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

const CloseButton = styled.button`
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 50%;
  border: none;
  background-color: #0e5c66;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0a4850;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isUser ? '#e6e6e6' : '#0e5c66'};
  color: ${props => props.isUser ? 'black' : 'white'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: pre-line;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 15px;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
  align-items: center;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 12px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  margin-right: 10px;
  
  &:focus {
    border-color: #0e5c66;
    box-shadow: 0 0 0 2px rgba(14, 92, 102, 0.1);
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #0e5c66;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0a4850;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  span {
    transform: rotate(-45deg);
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
  max-width: 100%;
`;

const OptionButton = styled.button`
  padding: 12px 16px;
  background-color: ${props => 
    props.isSpecial ? '#0e5c66' : 
    props.isSelected ? 'white' : 
    'transparent'};
  border: 2px solid ${props => 
    props.isSpecial ? '#0e5c66' : 
    props.isSelected ? '#0e5c66' : 
    '#e0e0e0'};
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${props => 
    props.isSpecial ? 'white' : 
    props.isSelected ? '#333' : 
    '#666'};
  font-size: 14px;
  font-weight: ${props => props.isSpecial ? '700' : '500'};
  box-shadow: ${props => 
    props.isSelected ? '0 4px 6px rgba(14, 92, 102, 0.2)' : 
    'none'};
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => 
      props.isSpecial ? '#0a4850' : 
      props.isSelected ? 'white' : 
      'rgba(14, 92, 102, 0.1)'};
    border-color: #0e5c66;
    box-shadow: 0 4px 8px rgba(14, 92, 102, 0.15);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(14, 92, 102, 0.1);
  }

  ${props => props.isSelected && `
    &::after {
      content: '✓';
      margin-left: 8px;
      font-size: 16px;
      color: #0e5c66;
    }
  `}
`;

export default ChatBot;