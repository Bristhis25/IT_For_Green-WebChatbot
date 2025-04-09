import styled from 'styled-components';

// Modal components
export const ModalContainer = styled.div`
  display: flex;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  align-items: center;
  justify-content: center;
`;

export const ModalContent = styled.div`
  background-color: #fefefe;
  max-width: 500px;
  width: 90%;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

// Form components
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

export const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #66afe9;
    box-shadow: 0 0 5px rgba(102, 175, 233, 0.5);
  }
`;

export const Button = styled.button`
  background-color: #1E88E5;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #d9534f;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
`;

export const LinkText = styled.div`
  margin-top: 15px;
  text-align: center;
`;

export const LinkButton = styled.button`
  background: none;
  border: none;
  color: #1E88E5;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;
