import React from 'react';
import styled from 'styled-components';

const ChatBotButton = ({ onClick }) => {
  return (
    <ButtonContainer onClick={onClick}>
      <ButtonIcon>💬</ButtonIcon>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #0e5c66;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonIcon = styled.span`
  font-size: 24px;
`;

export default ChatBotButton;
