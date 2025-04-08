import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import avatarIcon from '../assets/img/learnia-avatar.png';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isQuestionnaire, setIsQuestionnaire] = useState(false);
  const messagesEndRef = useRef(null);

  // Fonction pour scroller automatiquement
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour démarrer le questionnaire
  const startQuestionnaire = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'start' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMessages([{ type: 'bot', text: data.response }]);
        if (data.is_questionnaire) {
          setOptions(data.options || []);
          setSelectedOptions(data.selected_options || []);
          setIsQuestionnaire(true);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessages([{ 
        type: 'bot', 
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment." 
      }]);
    }
  };

  // Démarrer le questionnaire à l'ouverture
  useEffect(() => {
    startQuestionnaire();
  }, []);

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    const messageToSend = inputValue;
    setInputValue('');
    
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
        if (data.is_questionnaire) {
          setOptions(data.options || []);
          setSelectedOptions(data.selected_options || []);
          setIsQuestionnaire(true);
        } else {
          setOptions([]);
          setSelectedOptions([]);
          setIsQuestionnaire(false);
        }
      } else {
        throw new Error(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment." 
      }]);
    }
  };

  // Fonction pour sélectionner une option du questionnaire
  const handleOptionSelect = async (option) => {
    if (option === 'Terminer') {
      // Ne pas ajouter "Terminer" aux messages
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: option }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
          if (data.is_questionnaire) {
            setOptions(data.options || []);
            setSelectedOptions(data.selected_options || []);
            setIsQuestionnaire(true);
          } else {
            setOptions([]);
            setSelectedOptions([]);
            setIsQuestionnaire(false);
          }
        } else {
          throw new Error(data.error || 'Une erreur est survenue');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment." 
        }]);
      }
    } else {
      // Gérer la sélection/désélection des compétences
      if (selectedOptions.includes(option)) {
        setSelectedOptions(prev => prev.filter(item => item !== option));
      } else {
        setSelectedOptions(prev => [...prev, option]);
      }
      
      // Envoyer la mise à jour au serveur
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: option }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
          if (data.is_questionnaire) {
            setOptions(data.options || []);
            setSelectedOptions(data.selected_options || []);
            setIsQuestionnaire(true);
          } else {
            setOptions([]);
            setSelectedOptions([]);
            setIsQuestionnaire(false);
          }
        } else {
          throw new Error(data.error || 'Une erreur est survenue');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment." 
        }]);
      }
    }
  };

  // Fonction pour réinitialiser la conversation
  const handleReset = async () => {
    try {
      // Réinitialiser l'état local
      setMessages([]);
      setInputValue('');
      setOptions([]);
      setSelectedOptions([]);
      setIsQuestionnaire(false);

      // Appeler l'API pour réinitialiser la session et redémarrer le questionnaire
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'start' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMessages([{ type: 'bot', text: data.response }]);
        if (data.is_questionnaire) {
          setOptions(data.options || []);
          setSelectedOptions(data.selected_options || []);
          setIsQuestionnaire(true);
        }
      } else {
        throw new Error(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessages([{ 
        type: 'bot', 
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment." 
      }]);
    }
  };

  return (
    <ChatBotContainer>
      <Header>
        <HeaderAvatar src={avatarIcon} alt="ChatBot Avatar" />
        <Title>Chatbot Learnia</Title>
        <ResetButton onClick={handleReset}>↺ Recommencer</ResetButton>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </Header>
      
      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.type === 'user'}>
            {message.text}
          </Message>
        ))}
        {isQuestionnaire && options.length > 0 && (
          <OptionsContainer>
            {options.map((option, index) => (
              <OptionButton
                key={index}
                onClick={() => handleOptionSelect(option.label)}
                isSelected={selectedOptions.includes(option.label)}
                isSpecial={option.label === 'Terminer' || option.label === 'Autres'}
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
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Écrivez votre message..."
          disabled={isQuestionnaire}
        />
        <SendButton onClick={handleSendMessage} disabled={isQuestionnaire}>
          <span>➤</span>
        </SendButton>
      </InputContainer>
    </ChatBotContainer>
  );
};

// Styles
const ChatBotContainer = styled.div`
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

const Header = styled.div`
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

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  flex-grow: 1;
  color: white;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
  padding: 5px 10px;
  border: 1px solid white;
  border-radius: 15px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
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

const Message = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isUser ? '#e6e6e6' : '#0e5c66'};
  color: ${props => props.isUser ? 'black' : 'white'};
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

// Ajout des styles pour les options
const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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