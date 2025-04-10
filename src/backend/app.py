from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from src.utils.questionnaire import Questionnaire
from src.utils.decision_tree import DecisionTree

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialiser le questionnaire
questionnaire = Questionnaire()

# Initialiser le decision tree
decision_tree = DecisionTree()

# Stocker les sessions utilisateurs
sessions = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questionnaire/init', methods=['POST'])
def init_questionnaire():
    """Initialise une nouvelle session de questionnaire."""
    session_id = request.headers.get('X-Session-ID', 'default')
    
    # Initialiser une nouvelle session
    sessions[session_id] = {
        'etape_actuelle': None,
        'reponses': {},
        'complete': False
    }
    
    # Obtenir la première étape
    etape_suivante = questionnaire.get_etape_suivante()
    
    return jsonify({
        'etape': etape_suivante,
        'message': questionnaire.get_message_etape('accueil'),
        'options': questionnaire.get_options_etape(etape_suivante)
    })

@app.route('/api/questionnaire/reponse', methods=['POST'])
def traiter_reponse():
    """Traite la réponse de l'utilisateur et renvoie l'étape suivante."""
    try:
        session_id = request.headers.get('X-Session-ID', 'default')
        data = request.json
        
        if session_id not in sessions:
            return jsonify({
                'error': 'Session invalide',
                'success': False
            }), 400
            
        session = sessions[session_id]
        etape_actuelle = session['etape_actuelle'] or questionnaire.etapes[0]
        reponse = data.get('reponse')
        
        # Enregistrer la réponse
        session['reponses'][etape_actuelle] = reponse
        
        # Obtenir l'étape suivante
        etape_suivante = questionnaire.get_etape_suivante(etape_actuelle)
        
        if etape_suivante:
            # Il y a une étape suivante
            session['etape_actuelle'] = etape_suivante
            return jsonify({
                'success': True,
                'etape': etape_suivante,
                'message': questionnaire.get_message_etape(etape_suivante),
                'options': questionnaire.get_options_etape(etape_suivante)
            })
        else:
            # Le questionnaire est terminé
            session['complete'] = True
            formations_recommandees = questionnaire.calculer_score_formations(session['reponses'])
            
            # Générer les réponses détaillées pour les 3 meilleures formations
            reponses_formations = []
            for formation, score, details in formations_recommandees[:3]:
                reponse = questionnaire.generer_reponse_formation(details)
                reponses_formations.append({
                    'formation': formation,
                    'score': score,
                    'details': reponse
                })
            
            return jsonify({
                'success': True,
                'complete': True,
                'formations': reponses_formations
            })
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/questionnaire/reset', methods=['POST'])
def reset_questionnaire():
    """Réinitialise le questionnaire pour une session."""
    session_id = request.headers.get('X-Session-ID', 'default')
    if session_id in sessions:
        del sessions[session_id]
    
    return jsonify({
        'success': True,
        'message': "Questionnaire réinitialisé"
    })

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Gère les messages du chatbot."""
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    
    try:
        data = request.json
        message = data.get('message')
        session_id = request.headers.get('X-Session-ID', 'default')
        
        if not message:
            return jsonify({
                'error': 'Message manquant',
                'success': False
            }), 400

        # Si le message est 'start', réinitialiser la session
        if message.lower() == 'start':
            if session_id in sessions:
                del sessions[session_id]
            sessions[session_id] = {
                'etape_actuelle': None,
                'reponses': {},
                'complete': False,
                'competences_selectionnees': [],
                'formations_calculees': None
            }
            # Commencer le questionnaire
            etape_suivante = questionnaire.get_etape_suivante()
            sessions[session_id]['etape_actuelle'] = etape_suivante
            return jsonify({
                'success': True,
                'response': questionnaire.get_message_etape('accueil'),
                'options': questionnaire.get_options_etape(etape_suivante),
                'is_questionnaire': True
            })

        # Vérifier si c'est une nouvelle session
        if session_id not in sessions:
            sessions[session_id] = {
                'etape_actuelle': None,
                'reponses': {},
                'complete': False,
                'competences_selectionnees': [],
                'formations_calculees': None
            }
            # Commencer le questionnaire
            etape_suivante = questionnaire.get_etape_suivante()
            sessions[session_id]['etape_actuelle'] = etape_suivante
            return jsonify({
                'success': True,
                'response': questionnaire.get_message_etape('accueil'),
                'options': questionnaire.get_options_etape(etape_suivante),
                'is_questionnaire': True
            })

        session = sessions[session_id]

        # Gérer le retour à la liste des formations
        if message == "↩️ Retour aux formations" and session['formations_calculees']:
            response_text, options = questionnaire.generer_reponse_formations(session['formations_calculees'])
            return jsonify({
                'success': True,
                'response': response_text,
                'options': options,
                'is_questionnaire': True
            })

        # Gérer la sélection d'une formation spécifique
        if message.startswith("📚 ") and session['formations_calculees']:
            for _, _, details in session['formations_calculees']:
                if message.startswith(f"📚 {details['titre']}"):
                    response_text, options = questionnaire.generer_details_formation(details)
                    return jsonify({
                        'success': True,
                        'response': response_text,
                        'options': options,
                        'is_questionnaire': True
                    })

        # Si le questionnaire est en cours
        if not session['complete']:
            etape_actuelle = session['etape_actuelle']
            
            # Gestion spéciale pour les compétences
            if etape_actuelle == 'competences':
                if message.lower() == 'terminer':
                    # Formater les compétences sélectionnées avec un niveau par défaut
                    competences_formatees = []
                    for comp in session['competences_selectionnees']:
                        competences_formatees.append({
                            'id': comp,
                            'niveau': 'intermédiaire'
                        })
                    
                    # Passer à l'étape suivante
                    etape_suivante = questionnaire.get_etape_suivante(etape_actuelle)
                    session['etape_actuelle'] = etape_suivante
                    session['reponses'][etape_actuelle] = competences_formatees
                    return jsonify({
                        'success': True,
                        'response': questionnaire.get_message_etape(etape_suivante),
                        'options': questionnaire.get_options_etape(etape_suivante),
                        'is_questionnaire': True
                    })
                elif message.lower() == 'autres':
                    return jsonify({
                        'success': True,
                        'response': "Veuillez décrire vos autres compétences :",
                        'is_questionnaire': True,
                        'waiting_for_other_skills': True
                    })
                elif 'waiting_for_other_skills' in session and session['waiting_for_other_skills']:
                    session['competences_selectionnees'].append(message)
                    session['waiting_for_other_skills'] = False
                elif message not in session['competences_selectionnees']:
                    session['competences_selectionnees'].append(message)
                else:
                    session['competences_selectionnees'].remove(message)
                
                # Afficher les compétences sélectionnées
                competences_msg = "Compétences sélectionnées : " + ", ".join(session['competences_selectionnees']) if session['competences_selectionnees'] else "Aucune compétence sélectionnée"
                
                # Ajouter les options "Autres" et "Terminer"
                options = questionnaire.get_options_etape(etape_actuelle)
                if not any(opt['label'] == 'Autres' for opt in options):
                    options.append({'label': 'Autres', 'value': 'autres'})
                options.append({'label': 'Terminer', 'value': 'terminer'})
                
                return jsonify({
                    'success': True,
                    'response': competences_msg,
                    'options': options,
                    'is_questionnaire': True,
                    'selected_options': session['competences_selectionnees']
                })
            
            # Pour les autres étapes
            etape_suivante = questionnaire.get_etape_suivante(etape_actuelle)
            
            # Enregistrer la réponse
            session['reponses'][etape_actuelle] = message
            
            # Si c'était la dernière étape
            if not etape_suivante:
                session['complete'] = True
                # Calculer les formations recommandées
                formations = questionnaire.calculer_score_formations(session['reponses'])
                session['formations_calculees'] = formations
                response_text, options = questionnaire.generer_reponse_formations(formations)
                return jsonify({
                    'success': True,
                    'response': response_text,
                    'options': options,
                    'is_questionnaire': True
                })
            
            # Passer à l'étape suivante
            session['etape_actuelle'] = etape_suivante
            return jsonify({
                'success': True,
                'response': questionnaire.get_message_etape(etape_suivante),
                'options': questionnaire.get_options_etape(etape_suivante),
                'is_questionnaire': True
            })

        return jsonify({
            'success': True,
            'response': "Le questionnaire est terminé. Vous pouvez le recommencer en cliquant sur le bouton 'Recommencer'.",
            'options': [],
            'is_questionnaire': False
        })

    except Exception as e:
        print(f"Erreur dans le chatbot : {str(e)}")
        return jsonify({
            'error': "Une erreur s'est produite",
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 