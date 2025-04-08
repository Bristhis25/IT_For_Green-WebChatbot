import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import intents from '../data/intent.json';
import avatarIcon from '../assets/img/learnia-avatar.png';



const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [attenteVille, setAttenteVille] = useState(false);
  const [attenteCompetences, setAttenteCompetences] = useState(false);
  const [contexte, setContexte] = useState({
    etape: 'accueil',
    formationEnCours: null,
    informationsManquantes: [],
    competencesUtilisateur: []
  });
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const [choixActuels, setChoixActuels] = useState([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  // Fonction pour scroller automatiquement
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Appeler scrollToBottom à chaque mise à jour des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour calculer la distance entre deux points
  const calculerDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fonction pour calculer les émissions CO2
  const calculerEmissionsCO2 = (distance) => {
    // Estimation : 0.2 kg CO2/km pour une voiture
    return distance * 0.2;
  };

  // Fonction pour trouver la meilleure intention correspondante
  const findBestIntent = (message) => {
    const messageLower = message.toLowerCase();
    
    // Vérification des mots-clés généraux pour les formations
    if (messageLower.includes('formation') || 
        messageLower.includes('formations') || 
        messageLower.includes('développeur') || 
        messageLower.includes('developpeur') ||
        messageLower.includes('apprendre') ||
        messageLower.includes('étudier')) {
      return {
        tag: 'developpement_informatique',
        patterns: [],
        responses: ["Voici nos formations disponibles :\n\n" +
                   "1. Développeur Web Full Stack\n" +
                   "2. Développeur Mobile\n" +
                   "3. Data Scientist\n" +
                   "4. Ingénieur IA\n" +
                   "5. Développeur de Jeux\n" +
                   "6. Cloud Computing\n" +
                   "7. Cybersécurité\n" +
                   "8. Administrateur Système\n" +
                   "9. Consultant IT\n\n" +
                   "Quelle formation vous intéresse ?"]
      };
    }
    
    // Vérification directe des mots-clés pour chaque formation avec pondération
    const motsClesFormations = {
      'developpeur_web': [
        { mot: 'web', poids: 2 },
        { mot: 'html', poids: 1.5 },
        { mot: 'css', poids: 1.5 },
        { mot: 'javascript', poids: 1.5 },
        { mot: 'react', poids: 1.5 },
        { mot: 'node', poids: 1.5 },
        { mot: 'frontend', poids: 1.8 },
        { mot: 'backend', poids: 1.8 },
        { mot: 'développement web', poids: 2.5 },
        { mot: 'dev web', poids: 2 },
        { mot: 'développeur web', poids: 2.5 }
      ],
      'data_scientist': [
        { mot: 'data', poids: 2 },
        { mot: 'analyse', poids: 1.5 },
        { mot: 'python', poids: 1.5 },
        { mot: 'machine learning', poids: 2 },
        { mot: 'ml', poids: 1.8 },
        { mot: 'statistiques', poids: 1.5 },
        { mot: 'big data', poids: 2 },
        { mot: 'data science', poids: 2.5 }
      ],
      'developpeur_mobile': [
        { mot: 'mobile', poids: 2 },
        { mot: 'android', poids: 1.8 },
        { mot: 'ios', poids: 1.8 },
        { mot: 'flutter', poids: 1.5 },
        { mot: 'react native', poids: 1.5 },
        { mot: 'app', poids: 1.5 },
        { mot: 'application mobile', poids: 2.5 }
      ],
      'ingenieur_ia': [
        { mot: 'ia', poids: 2 },
        { mot: 'intelligence artificielle', poids: 2.5 },
        { mot: 'deep learning', poids: 2 },
        { mot: 'neural', poids: 1.5 },
        { mot: 'ai', poids: 1.8 },
        { mot: 'réseau de neurones', poids: 2 }
      ],
      'developpeur_jeux': [
        { mot: 'jeux', poids: 2 },
        { mot: 'game', poids: 1.8 },
        { mot: 'unity', poids: 1.8 },
        { mot: 'unreal', poids: 1.8 },
        { mot: 'gaming', poids: 1.5 },
        { mot: 'jeu vidéo', poids: 2.5 },
        { mot: 'game dev', poids: 2 }
      ],
      'cloud_computing': [
        { mot: 'cloud', poids: 2 },
        { mot: 'aws', poids: 1.8 },
        { mot: 'azure', poids: 1.8 },
        { mot: 'gcp', poids: 1.8 },
        { mot: 'devops', poids: 1.5 },
        { mot: 'infrastructure', poids: 1.5 },
        { mot: 'cloud computing', poids: 2.5 }
      ],
      'cybersecurite': [
        { mot: 'sécurité', poids: 2 },
        { mot: 'cyber', poids: 1.8 },
        { mot: 'hacking', poids: 1.8 },
        { mot: 'pentest', poids: 1.8 },
        { mot: 'sécurité informatique', poids: 2.5 },
        { mot: 'cybersécurité', poids: 2.5 }
      ],
      'admin_systeme': [
        { mot: 'système', poids: 2 },
        { mot: 'linux', poids: 1.8 },
        { mot: 'windows', poids: 1.8 },
        { mot: 'réseau', poids: 1.5 },
        { mot: 'administration', poids: 1.5 },
        { mot: 'sysadmin', poids: 2 },
        { mot: 'administrateur système', poids: 2.5 }
      ],
      'consultant_ti': [
        { mot: 'consultant', poids: 2 },
        { mot: 'conseil', poids: 1.5 },
        { mot: 'ti', poids: 1.8 },
        { mot: 'technologies', poids: 1.5 },
        { mot: 'transformation digitale', poids: 2.5 },
        { mot: 'conseil en informatique', poids: 2.5 }
      ]
    };

    // Calculer le score pondéré pour chaque formation
    const scores = {};
    Object.entries(motsClesFormations).forEach(([formation, mots]) => {
      scores[formation] = mots.reduce((total, { mot, poids }) => {
        // Vérifier si le mot est présent dans le message
        if (messageLower.includes(mot)) {
          // Ajouter un bonus si le mot est exactement le même
          const bonusExact = mot === messageLower ? 0.5 : 0;
          return total + poids + bonusExact;
        }
        return total;
      }, 0);
    });

    // Trouver la formation avec le score le plus élevé
    const meilleureFormation = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .find(([_, score]) => score > 0);

    if (meilleureFormation && meilleureFormation[1] > 0) {
      return intents.intents.find(intent => intent.tag === meilleureFormation[0]);
    }

    // Si aucune formation n'est détectée, vérifier les intentions générales
    const intentionsGenerales = intents.intents.filter(intent => 
      intent.patterns.some(pattern => messageLower.includes(pattern))
    );

    if (intentionsGenerales.length > 0) {
      return intentionsGenerales[0];
    }

    return null;
  };

  // Fonction pour obtenir une réponse aléatoire d'une intention
  const getRandomResponse = (intent) => {
    const responses = intent.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Fonction pour trouver les formations correspondant aux compétences
  const trouverFormationsParCompetences = (competences) => {
    const formationsCorrespondantes = [];
    
    // Liste des compétences par formation
    const competencesParFormation = {
      'developpeur_web': ['html', 'css', 'javascript', 'react', 'node', 'web'],
      'data_scientist': ['python', 'sql', 'data', 'analyse', 'machine learning'],
      'developpeur_mobile': ['android', 'ios', 'flutter', 'react native', 'mobile'],
      'ingenieur_ia': ['python', 'machine learning', 'deep learning', 'ia'],
      'developpeur_jeux': ['unity', 'unreal', 'c++', 'game'],
      'cloud_computing': ['aws', 'azure', 'gcp', 'cloud'],
      'cybersecurite': ['sécurité', 'cyber', 'hacking', 'pentest']
    };

    Object.entries(competencesParFormation).forEach(([formation, competencesRequises]) => {
      const competencesCommunes = competences.filter(competence => 
        competencesRequises.some(req => 
          competence.toLowerCase().includes(req.toLowerCase()) || 
          req.toLowerCase().includes(competence.toLowerCase())
        )
      );
      
      if (competencesCommunes.length > 0) {
        formationsCorrespondantes.push({
          formation,
          score: competencesCommunes.length / competencesRequises.length
        });
      }
    });

    return formationsCorrespondantes
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  // Fonction pour mettre à jour le contexte
  const mettreAJourContexte = (nouveauContexte) => {
    setContexte(prev => ({ ...prev, ...nouveauContexte }));
  };

  // Fonction pour trouver une formation par son tag
  const trouverFormationParTag = (tag) => {
    // Rechercher directement dans les formations
    return intents.formations.find(formation => formation.tag === tag);
  };

  // Fonction pour générer des suggestions de questions
  const genererSuggestions = (etape) => {
    switch (etape) {
      case 'accueil':
        return [
          "Quelles formations en développement proposez-vous ?",
          "Comment fonctionne le système de notation écologique ?",
          "Pouvez-vous m'aider à choisir une formation ?"
        ];
      case 'competences':
        return [
          "Je connais HTML, CSS et JavaScript",
          "Je maîtrise Python et SQL",
          "Je n'ai aucune compétence en programmation"
        ];
      case 'selection_formation':
        return [
          "Quelle est la durée de la formation ?",
          "Quel est le niveau requis ?",
          "Quelles sont les modalités d'apprentissage ?"
        ];
      case 'details_formation':
        return [
          "Quel est le coût de la formation ?",
          "Y a-t-il des prérequis ?",
          "Quelles sont les débouchés ?"
        ];
      default:
        return [];
    }
  };

  // Fonction pour gérer les réponses ambiguës
  const gererReponseAmbigue = (message) => {
    const messageLower = message.toLowerCase();
    
    // Liste des mots-clés importants pour chaque intention
    const motsClesParIntent = {
      'developpeur_web': ['web', 'html', 'css', 'javascript', 'react', 'node'],
      'data_scientist': ['data', 'analyse', 'python', 'machine learning', 'ml'],
      'cybersecurite': ['sécurité', 'cyber', 'hacking', 'pentest'],
      'developpeur_mobile': ['mobile', 'android', 'ios', 'flutter', 'react native'],
      'ingenieur_ia': ['ia', 'intelligence artificielle', 'deep learning', 'neural'],
      'developpeur_jeux': ['jeux', 'game', 'unity', 'unreal'],
      'cloud_computing': ['cloud', 'aws', 'azure', 'gcp'],
      'developpement_informatique': ['développement', 'informatique', 'programmation', 'coder']
    };

    // Compter les occurrences de mots-clés pour chaque intention
    const scores = {};
    Object.entries(motsClesParIntent).forEach(([intent, mots]) => {
      scores[intent] = mots.reduce((total, mot) => {
        return total + (messageLower.includes(mot) ? 1 : 0);
      }, 0);
    });

    // Filtrer les intentions avec au moins un mot-clé
    const intentionsPossibles = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    if (intentionsPossibles.length > 1) {
      let message = "Je vois que vous parlez de développement. Pouvez-vous préciser votre intérêt parmi :\n\n";
      intentionsPossibles.forEach(([intent, score]) => {
        const intentInfo = intents.intents.find(i => i.tag === intent);
        if (intentInfo) {
          message += `- ${intentInfo.tag.replace(/_/g, ' ')} (${score} correspondance${score > 1 ? 's' : ''})\n`;
        }
      });
      return message;
    }
    return null;
  };

  // Fonction pour gérer le flux de conversation
  const gererFluxConversation = (intent, message) => {
    // Vérifier si la réponse est ambiguë
    const reponseAmbigue = gererReponseAmbigue(message);
    if (reponseAmbigue) {
      return reponseAmbigue;
    }

    // Si l'utilisateur demande des informations sur les formations
    if (intent.tag === 'developpement_informatique') {
      mettreAJourContexte({ 
        etape: 'selection_formation',
        informationsManquantes: []
      });
      setSuggestions([
        "Développeur Web",
        "Data Scientist",
        "Développeur Mobile",
        "Ingénieur IA"
      ]);
      return intent.responses[0];
    }

    switch (contexte.etape) {
      case 'accueil':
        if (intent.tag === 'salutations') {
          setSuggestions([
            "Quelles formations proposez-vous ?",
            "Je veux devenir développeur web",
            "J'aimerais apprendre la data science"
          ]);
          return "Bonjour ! Je suis l'assistant Learnia de Skill4Mind. Je peux vous aider à trouver la formation idéale, vous renseigner sur les tarifs et calculer l'impact écologique de chaque formation. Comment puis-je vous aider aujourd'hui ?";
        }
        if (intent.tag === 'au_revoir') {
          return "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions sur nos formations.";
        }
        if (intent.tag.startsWith('developpeur_') || intent.tag === 'data_scientist' || intent.tag === 'ingenieur_ia') {
          const formation = trouverFormationParTag(intent.tag);
          if (formation) {
            mettreAJourContexte({ 
              etape: 'details_formation',
              formationEnCours: formation,
              informationsManquantes: ['localisation']
            });
            setSuggestions([
              "Quelle est la durée ?",
              "Quel est le prix ?",
              "Quels sont les prérequis ?"
            ]);
            return construireMessageFormation(formation);
          }
        }
        break;

      case 'selection_formation':
        const formation = trouverFormationParTag(intent.tag);
        if (formation) {
          mettreAJourContexte({ 
            etape: 'details_formation',
            formationEnCours: formation,
            informationsManquantes: ['localisation']
          });
          setSuggestions([
            "Quelle est la durée ?",
            "Quel est le prix ?",
            "Quels sont les prérequis ?"
          ]);
          return construireMessageFormation(formation);
        }
        break;

      case 'competences':
        if (intent.tag === 'competences') {
          const competences = message.toLowerCase().split(/[,;\s]+/).filter(Boolean);
          const formations = trouverFormationsParCompetences(competences);
          
          if (formations.length > 0) {
            return construireMessageFormations(formations);
          } else {
            return "Je n'ai pas trouvé de formation correspondant exactement à vos compétences. Voici toutes nos formations en développement :\n\n" +
                   "- Développeur Web\n" +
                   "- Développeur Mobile\n" +
                   "- Développeur de Jeux Vidéo\n" +
                   "- Data Scientist\n" +
                   "- Ingénieur en Intelligence Artificielle\n\n" +
                   "Laquelle vous intéresse ?";
          }
        }
        break;

      case 'details_formation':
        if (intent.tag === 'localisation') {
          return "Pour calculer l'impact écologique de votre formation, pouvez-vous me dire dans quelle ville vous êtes situé ?";
        }
        if (intent.tag === 'questions_formation') {
          const formation = contexte.formationEnCours;
          if (formation) {
            if (message.includes('durée')) {
              return `La formation ${formation.titre} dure ${formation.duree}.`;
            }
            if (message.includes('prix') || message.includes('coût') || message.includes('tarif')) {
              return `Le coût de la formation ${formation.titre} est de ${formation.prix}.`;
            }
            if (message.includes('niveau')) {
              return `Le niveau requis pour la formation ${formation.titre} est : ${formation.niveau}.`;
            }
            if (message.includes('prérequis')) {
              return `Prérequis pour la formation ${formation.titre} :\n${formation.prerequis.join('\n')}`;
            }
            if (message.includes('programme') || message.includes('contenu')) {
              return `Programme de la formation ${formation.titre} :\n${formation.programme.map(m => `\n${m.titre}:\n${m.contenu.join('\n')}`).join('\n')}`;
            }
            if (message.includes('débouchés') || message.includes('emploi')) {
              return `Débouchés après la formation ${formation.titre} :\n${formation.debouches.join('\n')}`;
            }
          }
        }
        if (intent.tag === 'reponse_positive') {
          return "Parfait ! Que souhaitez-vous savoir d'autre sur cette formation ?";
        }
        if (intent.tag === 'reponse_negative') {
          return "D'accord, n'hésitez pas à me poser d'autres questions quand vous le souhaitez !";
        }
        break;

      default:
        return "Je ne comprends pas bien votre demande. Pouvez-vous reformuler ?";
    }

    return "Je ne comprends pas bien votre demande. Pouvez-vous reformuler ?";
  };

  // Fonction pour construire le message des formations proposées
  const construireMessageFormations = (formations) => {
    let message = "D'après vos compétences, je peux vous recommander les formations suivantes :\n\n";
    formations.forEach(({ formation, score }) => {
      const formationInfo = trouverFormationParTag(formation);
      if (formationInfo) {
        message += `- ${formationInfo.titre} (${(score * 100).toFixed(0)}% de correspondance)\n`;
      }
    });
    message += "\nLaquelle vous intéresse le plus ?";
    return message;
  };

  // Fonction pour construire le message d'une formation
  const construireMessageFormation = (formation) => {
    let message = `FORMATION : ${formation.titre}\n\n`;
    
    // Description
    message += `📝 DESCRIPTION :\n${formation.description}\n\n`;
    
    // Informations générales
    message += `📊 INFORMATIONS GÉNÉRALES :\n`;
    message += `- Durée : ${formation.duree}\n`;
    message += `- Niveau : ${formation.niveau}\n`;
    message += `- Prix : ${formation.prix}€\n\n`;
    
    // Compétences enseignées
    message += `🎯 COMPÉTENCES ENSEIGNÉES :\n`;
    formation.competences.forEach((competence, index) => {
      message += `${index + 1}. ${competence}\n`;
    });
    message += `\n`;
    
    // Modalités d'apprentissage
    message += `📚 MODALITÉS D'APPRENTISSAGE :\n`;
    message += `- En présentiel : ${formation.modalites.presentiel.villes.join(', ')}\n`;
    message += `- En distanciel : ${formation.modalites.distanciel.description}\n\n`;
    
    // Débouchés
    message += `💼 DÉBOUCHÉS :\n`;
    formation.debouches.forEach((debouch, index) => {
      message += `${index + 1}. ${debouch}\n`;
    });
    message += `\n`;
    
    // Prérequis
    message += `📋 PRÉREQUIS :\n`;
    formation.prerequis.forEach((prerequis, index) => {
      message += `${index + 1}. ${prerequis}\n`;
    });
    message += `\n`;
    
    // Programme détaillé
    message += `📖 PROGRAMME DÉTAILLÉ :\n`;
    formation.programme.forEach((module, index) => {
      message += `\nModule ${index + 1} : ${module.titre}\n`;
      module.contenu.forEach((point, subIndex) => {
        message += `  ${subIndex + 1}. ${point}\n`;
      });
    });
    message += `\n`;
    
    // Impact écologique
    message += `🌱 IMPACT ÉCOLOGIQUE :\n`;
    message += `Pour calculer l'impact écologique précis, pouvez-vous me dire dans quelle ville vous êtes situé ?\n\n`;
    
    // Call to action
    message += `❓ Souhaitez-vous plus d'informations sur un aspect particulier de cette formation ?\n`;
    message += `Ou voulez-vous que je calcule l'impact écologique en fonction de votre localisation ?`;

    return message;
  };

  // Fonction pour construire le message d'impact écologique
  const construireMessageImpactEcologique = (formation, ville) => {
    const distance = calculerDistance(
      intents.villes[ville].coordonnees.lat,
      intents.villes[ville].coordonnees.lon,
      intents.villes[formation.modalites.presentiel.villes[0]].coordonnees.lat,
      intents.villes[formation.modalites.presentiel.villes[0]].coordonnees.lon
    );
    
    const emissionsPresentiel = calculerEmissionsCO2(distance) * 2 * 5 * 4 * 6;
    const emissionsDistanciel = formation.modalites.distanciel.emissions_co2;
    
    return `Impact écologique pour la formation ${formation.titre} :\n\n` +
           `- En présentiel : ${emissionsPresentiel.toFixed(2)} kg CO2\n` +
           `- En distanciel : ${emissionsDistanciel.toFixed(2)} kg CO2\n\n` +
           `Le distanciel permet d'économiser ${(emissionsPresentiel - emissionsDistanciel).toFixed(2)} kg CO2 !\n\n` +
           "Souhaitez-vous plus d'informations sur cette formation ?";
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    setSuggestions([]); // Réinitialiser les suggestions
    
    setTimeout(() => {
      const intent = findBestIntent(inputValue);
      if (intent) {
        const reponse = gererFluxConversation(intent, inputValue);
        setMessages(prev => [...prev, { type: 'bot', text: reponse }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Je ne comprends pas bien votre demande. Pouvez-vous reformuler ?" 
        }]);
      }
    }, 1000);
    
    setInputValue('');
  };

  // Fonction pour générer les choix selon l'étape
  const genererChoix = (etape) => {
    switch (etape) {
      case 'accueil':
        return [
          { texte: "Trouver une formation selon mes compétences", action: 'RECHERCHE_COMPETENCES' },
          { texte: "Voir toutes les formations", action: 'LISTE_FORMATIONS' }
        ];
      case 'saisie_competences':
        return [
          { texte: "HTML/CSS/JavaScript", action: 'COMP_WEB' },
          { texte: "Python/Data Science", action: 'COMP_DATA' },
          { texte: "Java/Mobile", action: 'COMP_MOBILE' },
          { texte: "Sécurité/Réseaux", action: 'COMP_SECU' },
          { texte: "Cloud/DevOps", action: 'COMP_CLOUD' },
          { texte: "Aucune compétence", action: 'COMP_AUCUNE' }
        ];
      case 'details_formation':
        return [
          { texte: "Durée et prix", action: 'DETAILS_DUREE_PRIX' },
          { texte: "Programme", action: 'DETAILS_PROGRAMME' },
          { texte: "Prérequis", action: 'DETAILS_PREREQUIS' },
          { texte: "Impact écologique", action: 'DETAILS_ECO' },
          { texte: "← Retour aux formations", action: 'RETOUR_FORMATIONS' }
        ];
      case 'selection_formation':
        return [
          { texte: "Développeur Web", action: 'SELECT_DEV_WEB' },
          { texte: "Data Scientist", action: 'SELECT_DATA' },
          { texte: "Développeur Mobile", action: 'SELECT_MOBILE' },
          { texte: "Ingénieur IA", action: 'SELECT_IA' },
          { texte: "Cybersécurité", action: 'SELECT_CYBER' },
          { texte: "Cloud Computing", action: 'SELECT_CLOUD' }
        ];
      default:
        return [];
    }
  };

  // Fonction pour gérer les clics sur les choix
  const handleChoixClick = (action) => {
    let reponse = '';
    let nouvelleEtape = contexte.etape;
    let formation = null;

    switch (action) {
      case 'RECHERCHE_COMPETENCES':
        reponse = "Pour vous orienter vers la formation la plus adaptée, sélectionnez vos compétences actuelles ou choisissez 'Aucune compétence' si vous débutez.";
        nouvelleEtape = 'saisie_competences';
        break;

      case 'COMP_WEB':
        reponse = analyserCompetences(['html', 'css', 'javascript']);
        nouvelleEtape = 'selection_formation';
        break;

      case 'COMP_DATA':
        reponse = analyserCompetences(['python', 'data', 'analyse', 'statistiques']);
        nouvelleEtape = 'selection_formation';
        break;

      case 'COMP_MOBILE':
        reponse = analyserCompetences(['java', 'mobile', 'android', 'ios']);
        nouvelleEtape = 'selection_formation';
        break;

      case 'COMP_SECU':
        reponse = analyserCompetences(['sécurité', 'réseau', 'cybersécurité']);
        nouvelleEtape = 'selection_formation';
        break;

      case 'COMP_CLOUD':
        reponse = analyserCompetences(['cloud', 'devops', 'aws', 'azure']);
        nouvelleEtape = 'selection_formation';
        break;

      case 'COMP_AUCUNE':
        reponse = "Pas de problème ! Voici les formations adaptées aux débutants :\n\n" +
                  "1. Développeur Web Full Stack - Formation complète de zéro\n" +
                  "2. Data Scientist - Parcours débutant\n" +
                  "3. Développeur Mobile - Introduction\n\n" +
                  "Ces formations incluent une mise à niveau et des modules d'introduction. Laquelle vous intéresse ?";
        nouvelleEtape = 'selection_formation';
        break;

      case 'LISTE_FORMATIONS':
        reponse = "Voici nos formations disponibles :\n\n" +
                  "1. Développeur Web Full Stack\n" +
                  "2. Développeur Mobile\n" +
                  "3. Data Scientist\n" +
                  "4. Ingénieur IA\n" +
                  "5. Développeur de Jeux\n" +
                  "6. Cloud Computing\n" +
                  "7. Cybersécurité\n" +
                  "8. Administrateur Système\n" +
                  "9. Consultant IT";
        nouvelleEtape = 'selection_formation';
        break;

      case 'SELECT_DEV_WEB':
      case 'FORMATION_WEB':
        formation = trouverFormationParTag('developpeur_web');
        if (formation) {
          reponse = construireMessageFormation(formation);
          nouvelleEtape = 'details_formation';
        }
        break;

      case 'SELECT_DATA':
      case 'FORMATION_DATA':
        formation = trouverFormationParTag('data_scientist');
        if (formation) {
          reponse = construireMessageFormation(formation);
          nouvelleEtape = 'details_formation';
        }
        break;

      case 'DETAILS_DUREE_PRIX':
        if (contexte.formationEnCours) {
          reponse = `Durée : ${contexte.formationEnCours.duree}\nPrix : ${contexte.formationEnCours.prix}`;
        }
        break;

      case 'DETAILS_PROGRAMME':
        if (contexte.formationEnCours) {
          reponse = `Programme de la formation ${contexte.formationEnCours.titre} :\n\n${
            contexte.formationEnCours.programme.map(m => 
              `${m.titre}:\n${m.contenu.join('\n')}`
            ).join('\n\n')
          }`;
        }
        break;

      case 'DETAILS_PREREQUIS':
        if (contexte.formationEnCours) {
          reponse = `Prérequis pour la formation ${contexte.formationEnCours.titre} :\n${
            contexte.formationEnCours.prerequis.join('\n')
          }`;
        }
        break;

      case 'RETOUR_FORMATIONS':
        nouvelleEtape = 'selection_formation';
        reponse = "Quelle formation souhaitez-vous découvrir ?";
        break;

      default:
        reponse = "Je ne comprends pas votre choix. Pouvez-vous réessayer ?";
    }

    if (reponse) {
      setMessages(prev => [...prev, 
        { type: 'user', content: action },
        { type: 'bot', content: reponse }
      ]);
    }

    mettreAJourContexte({ 
      etape: nouvelleEtape,
      formationEnCours: formation || contexte.formationEnCours
    });
    setChoixActuels(genererChoix(nouvelleEtape));
  };

  // Ajouter une nouvelle fonction pour analyser les compétences
  const analyserCompetences = (competences) => {
    const formations = trouverFormationsParCompetences(competences);
    
    if (formations.length > 0) {
      let message = "D'après vos compétences, voici les formations les plus adaptées :\n\n";
      formations.forEach(({ formation, score }) => {
        const formationInfo = trouverFormationParTag(formation);
        if (formationInfo) {
          message += `${formationInfo.titre}\n`;
          message += `✓ Correspondance avec votre profil : ${(score * 100).toFixed(0)}%\n`;
          message += `✓ Durée : ${formationInfo.duree}\n`;
          message += `✓ Niveau : ${formationInfo.niveau}\n\n`;
        }
      });
      message += "Sélectionnez une formation pour plus de détails.";
      return message;
    } else {
      return "Je n'ai pas trouvé de formation correspondant exactement à vos compétences. Voici toutes nos formations disponibles.";
    }
  };

  // Initialisation du chatbot
  useEffect(() => {
    if (!isInitialized) {
      const messageAccueil = "Bonjour ! Je suis l'assistant Learnia de Skill4Mind. Je peux vous aider à trouver la formation idéale. Que souhaitez-vous découvrir ?";
      setMessages([{ type: 'bot', content: messageAccueil }]);
      setChoixActuels(genererChoix('accueil'));
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Ajouter la fonction de reset
  const handleReset = () => {
    setMessages([{
      type: 'bot',
      content: "Bonjour ! Je suis l'assistant Learnia de Skill4Mind. Je peux vous aider à trouver la formation idéale. Que souhaitez-vous découvrir ?"
    }]);
    setInputValue('');
    setContexte({
      etape: 'accueil',
      formationEnCours: null,
      informationsManquantes: [],
      competencesUtilisateur: []
    });
    setChoixActuels(genererChoix('accueil'));
    setAttenteVille(false);
    setAttenteCompetences(false);
  };

  return (
    <ChatBotContainer>
      <Header>
        <HeaderAvatar src={avatarIcon} alt="ChatBot Avatar" />
        <Title>Chatbot Learnia</Title>
        <ResetButton onClick={handleReset}>↺ Recommencer</ResetButton>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </Header>
      
      <MessagesContainer hasChoices={suggestionsVisible && choixActuels.length > 0}>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.type === 'user'}>
            {message.content}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {choixActuels.length > 0 && (
        <SuggestionsWrapper>
          <ToggleSuggestionsButton 
            onClick={() => setSuggestionsVisible(!suggestionsVisible)}
            isVisible={suggestionsVisible}
          >
            {suggestionsVisible ? '▼ Masquer les suggestions' : '▲ Afficher les suggestions'}
          </ToggleSuggestionsButton>
          
          <ChoicesContainer isVisible={suggestionsVisible}>
            {choixActuels.map((choix, index) => (
              <ChoiceButton
                key={index}
                onClick={() => handleChoixClick(choix.action)}
              >
                {choix.texte}
              </ChoiceButton>
            ))}
          </ChoicesContainer>
        </SuggestionsWrapper>
      )}

      <InputContainer>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Écrivez votre message..."
        />
        <SendButton onClick={handleSendMessage}>
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
const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  flex-grow: 1;
  color: white;
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
  transition: max-height 0.3s ease;
  max-height: ${props => props.hasChoices ? 'calc(100% - 180px)' : 'calc(100% - 80px)'};
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
const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 15px;
  background-color: #f0f0f0;
`;
const SendIcon = styled.span`
`;

const SuggestionsWrapper = styled.div`
  border-top: 1px solid #ddd;
  background-color: #f5f5f5;
`;

const ToggleSuggestionsButton = styled.button`
  width: 100%;
  padding: 8px;
  background-color: #0e5c66;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &:hover {
    background-color: #0a4850;
  }
`;

const ChoicesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px;
  justify-content: center;
  padding: ${props => props.isVisible ? '10px' : '0'};
  max-height: ${props => props.isVisible ? '200px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isVisible ? '1' : '0'};
`;

const ChoiceButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #0e5c66;
  border-radius: 20px;
  background-color: white;
  color: #0e5c66;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  margin: 4px;
  
  &:hover {
    background-color: #0e5c66;
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
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

export default ChatBot;