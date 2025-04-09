import React from "react";

export const About = (props) => {
  return (
    <div id="about">
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            {" "}
            <img src="img/about.svg" className="img-responsive" alt="" />{" "}
          </div>
          <div className="col-xs-12 col-md-6">
            <div className="about-text">
              <h2>Qui somme nous ?</h2>
              <p>{props.data ? props.data.paragraph : "loading..."}</p>
              <h3>Avantages</h3>
              <div className="list-style">
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    {props.data
                      ? props.data.avantages.map((d, i) => (
                          <li key={`${d}-${i}`}>{d}</li>
                        ))
                      : "loading"}
                  </ul>
                </div>
                <div className="col-lg-6 col-sm-6 col-xs-12">
                  <ul>
                    {props.data
                      ? props.data.avantages2.map((d, i) => (
                          <li key={`${d}-${i}`}> {d}</li>
                        ))
                      : "loading"}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <br/>
          <div className="col-xs-12 col-md-12 ">
            <div className="about-text-2">
              <h3>Comprendre le Scoring Écologique de notre ChatBot</h3>
              <p>{props.data ? props.data.scoringP1 : "loading..."}</p>
            
              <h3>Comment est calculé le score écologique ?</h3>
              <p>{props.data ? props.data.scoringP2 : "loading..."}</p>
            
              <h3>Comment est présenté le score écologique ?</h3>
              <p>{props.data ? props.data.scoringP3 : "loading..."}</p>
      
              <h3>Pourquoi est-ce important ?</h3>
              <p>{props.data ? props.data.scoringP4 : "loading..."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
