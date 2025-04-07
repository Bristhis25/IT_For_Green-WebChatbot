import React from "react";

export const Navigation = (props) => {
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
          </ul>
        </div>
      </div>
    </nav>
  );
};
