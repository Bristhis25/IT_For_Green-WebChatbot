import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import Register from "./Register";

export const Navigation = (props) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleModalClose = (action) => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    
    if (action === 'register') {
      setShowRegisterModal(true);
    } else if (action === 'login') {
      setShowLoginModal(true);
    }
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            {" "}
            <span className="sr-only">Toggle navigation</span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
          </button>
          <a className="navbar-brand page-scroll" href="#page-top">
            Skill4Mind Learn
          </a>{" "}
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <a href="#about" className="page-scroll">
                A Propos
              </a>
            </li>
            <li>
              <a href="#services" className="page-scroll">
                Nos domaines
              </a>
            </li>
            <li>
              <a href="#contact" className="page-scroll">
                Contacts
              </a>
            </li>
            <li>
              <a href="https://skills4mind.com/" className="page-scroll">
                Site officiel
              </a>
            </li>
            {currentUser ? (
              <li className="user-menu">
                <a href="#profile" className="page-scroll">
                  {currentUser.displayName || currentUser.email} ▼
                </a>
                <div className="dropdown-content">
                  <a href="#history" className="page-scroll">
                    Historique (bientôt)
                  </a>
                  <a href="#settings" className="page-scroll">
                    Paramètres
                  </a>
                  <a 
                    href="#logout" 
                    className="page-scroll"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    Déconnexion
                  </a>
                </div>
              </li>
            ) : (
              <li>
                <a 
                  href="#login" 
                  className="page-scroll"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLoginModal(true);
                  }}
                >
                  Connexion
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Modals de connexion/inscription */}
      {showLoginModal && <Login onClose={handleModalClose} />}
      {showRegisterModal && <Register onClose={handleModalClose} />}
    </nav>
  );
};
