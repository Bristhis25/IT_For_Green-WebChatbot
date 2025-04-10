import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { FaGoogle } from 'react-icons/fa';

const Register = ({ onClose, onSwitchToLogin }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName);
      onClose();
    } catch (error) {
      setError('Impossible de créer un compte. Veuillez réessayer.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (error) {
      setError('Échec de la connexion avec Google');
      console.error("Erreur de connexion Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer onClick={() => onClose()}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={() => onClose()}>&times;</CloseButton>
        <h2>Créer un compte</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nom</Label>
            <Input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label>Mot de passe</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </FormGroup>
          <FormGroup>
            <Label>Confirmer le mot de passe</Label>
            <Input 
              type="password" 
              value={passwordConfirm} 
              onChange={(e) => setPasswordConfirm(e.target.value)} 
              required 
              minLength="6"
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer un compte'}
          </Button>
        </Form>

        <Divider>
          <span>OU</span>
        </Divider>

        <GoogleButton 
          type="button" 
          onClick={handleGoogleSignIn} 
          disabled={loading}
        >
          <FaGoogle style={{ marginRight: '10px' }} /> S'inscrire avec Google
        </GoogleButton>

        <SwitchText>
            Déjà un compte? <SwitchLink onClick={() => onClose('login')}>Se connecter</SwitchLink>
        </SwitchText>
      </ModalContent>
    </ModalContainer>
  );
};

// Styles
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
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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

export default Register;
