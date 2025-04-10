import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styled from "styled-components";
import { FaGoogle } from "react-icons/fa"; 

const Login = ({ onClose }) => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      onClose();
    } catch {
      setError("Échec de la connexion");
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      setError("Échec de la connexion avec Google");
    }
    setLoading(false);
  }

  return (
    <ModalContainer>
      <ModalContent>
        <CloseButton onClick={() => onClose()}>&times;</CloseButton>
        <h2>Connexion</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Email</label>
            <input type="email" ref={emailRef} required />
          </FormGroup>
          <FormGroup>
            <label>Mot de passe</label>
            <input type="password" ref={passwordRef} required />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            Se connecter
          </Button>
        </Form>
        <Divider>
          <span>OU</span>
        </Divider>
        <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={loading}>
          <FaGoogle style={{ marginRight: "10px" }} /> Se connecter avec Google
        </GoogleButton>
        <SwitchText>
          Pas encore de compte? <SwitchLink onClick={() => onClose('register')}>S'inscrire</SwitchLink>
        </SwitchText>
      </ModalContent>
    </ModalContainer>
  );
};

// Styles conservés tels quels
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 5px;
  width: 100%;
  max-width: 400px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  
  label {
    margin-bottom: 0.5rem;
  }
  
  input {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const Button = styled.button`
  background-color: #0e5c66;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background-color: #0b3e46;
  }
  
  &:disabled {
    background-color: #cccccc;
  }
`;

const GoogleButton = styled(Button)`
  background-color: white;
  color: #757575;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  
  &:before,
  &:after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #ddd;
  }
  
  span {
    padding: 0 10px;
    color: #757575;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

// Nouveaux styles ajoutés
const SwitchText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: #757575;
`;

const SwitchLink = styled.span`
  color: #4285F4;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default Login;
