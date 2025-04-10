import json
from typing import Dict, List, Optional, Tuple, Any

class Questionnaire:
    def __init__(self, intent_file: str = 'src/data/intent.json'):
        with open(intent_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)['intents']
        self.etapes = self.data['etapes_questionnaire']['ordre']
        self.messages = self.data['etapes_questionnaire']['messages']
        
    def get_etape_suivante(self, etape_actuelle: Optional[str] = None) -> Optional[str]:
        """Retourne l'étape suivante du questionnaire."""
        if etape_actuelle is None:
            return self.etapes[0]
        try:
            index_actuel = self.etapes.index(etape_actuelle)
            if index_actuel < len(self.etapes) - 1:
                return self.etapes[index_actuel + 1]
        except ValueError:
            pass
        return None

    def get_options_etape(self, etape: str) -> List[Dict[str, Any]]:
        """Retourne les options disponibles pour une étape donnée."""
        if etape in self.data:
            if etape == 'competences':
                # Pour les compétences, on retourne une structure plate des options
                options = []
                for categorie, info in self.data[etape]['categories'].items():
                    for option in info['options']:
                        option_copy = option.copy()
                        option_copy['categorie'] = categorie
                        option_copy['categorie_label'] = info['label']
                        options.append(option_copy)
                return options
            return self.data[etape]['options']
        return []

    def calculer_score_formations(self, reponses: Dict[str, Any]) -> List[Tuple[str, float, Dict]]:
        """Calcule les scores pour chaque formation basé sur les réponses."""
        # Initialiser les scores pour toutes les formations disponibles
        scores = {}
        for domaine in self.data['domaines'].keys():
            scores[domaine] = 0.0

        try:
            # Niveau d'études
            if 'niveau_etudes' in reponses:
                niveau = reponses['niveau_etudes']
                for option in self.data['niveau_etudes']['options']:
                    if option['label'] == niveau:
                        for formation, poids in option['poids_formations'].items():
                            if formation in scores:
                                scores[formation] += poids

            # Domaines d'intérêt
            if 'domaines_interet' in reponses:
                domaines = reponses['domaines_interet']
                if isinstance(domaines, str):
                    domaines = [domaines]
                for domaine in domaines:
                    for option in self.data['domaines_interet']['options']:
                        if option['label'] == domaine:
                            for formation, poids in option['poids_formations'].items():
                                if formation in scores:
                                    scores[formation] += poids

            # Compétences
            if 'competences' in reponses:
                competences = reponses['competences']
                for comp in competences:
                    comp_id = comp['id'] if isinstance(comp, dict) else comp
                    niveau = comp.get('niveau', 'intermédiaire') if isinstance(comp, dict) else 'intermédiaire'
                    niveau_multiplicateur = {
                        'débutant': 0.8,
                        'intermédiaire': 1.0,
                        'avancé': 1.2
                    }.get(niveau, 1.0)
                    
                    for categorie in self.data['competences']['categories'].values():
                        for option in categorie['options']:
                            if option['label'] == comp_id:
                                for formation, poids in option['poids_formations'].items():
                                    if formation in scores:
                                        scores[formation] += poids * niveau_multiplicateur

            # Objectifs
            if 'objectifs' in reponses:
                objectif = reponses['objectifs']
                for option in self.data['objectifs']['options']:
                    if option['label'] == objectif:
                        poids_obj = option['poids']
                        for formation in option['formations_recommandees']:
                            if formation in scores:
                                scores[formation] *= poids_obj

            # Normaliser les scores (convertir en pourcentage)
            max_score = max(scores.values()) if scores else 1
            for formation in scores:
                scores[formation] = (scores[formation] / max_score) * 100

            # Trier les formations par score
            formations_triees = []
            for formation_id, score in scores.items():
                if score > 0:  # Ne retourner que les formations avec un score positif
                    try:
                        formation_info = self.data['domaines'][formation_id]
                        niveau = 'intermediaire' if score > 70 else 'debutant'
                        details_formation = formation_info['formations'][niveau]
                        
                        formations_triees.append((
                            formation_id,
                            score,
                            {
                                'titre': details_formation['titre'],
                                'duree': details_formation['duree'],
                                'prix': details_formation['prix'],
                                'prerequis': details_formation['prerequis'],
                                'programme': details_formation['programme'],
                                'impact_ecologique': details_formation['impact_ecologique']
                            }
                        ))
                    except KeyError as e:
                        print(f"Formation non trouvée : {formation_id}, erreur : {str(e)}")
                        continue

            return sorted(formations_triees, key=lambda x: x[1], reverse=True)

        except Exception as e:
            print(f"Erreur dans calculer_score_formations : {str(e)}")
            return []

    def generer_reponse_formations(self, formations_triees: List[Tuple[str, float, Dict]]) -> Tuple[str, List[Dict[str, Any]]]:
        """Génère une réponse avec la liste des formations recommandées et leurs options."""
        if not formations_triees:
            return "Désolé, je n'ai pas trouvé de formations correspondant à vos critères.", []

        message = "Voici les formations recommandées pour votre profil :\n\n"
        options = []

        for formation_id, score, details in formations_triees:
            option_id = f"formation_{formation_id}"
            options.append({
                "id": option_id,
                "label": f"📚 {details['titre']} ({score:.0f}% de correspondance)",
                "type": "formation",
                "details": details
            })

        return message, options

    def generer_details_formation(self, formation_details: Dict) -> Tuple[str, List[Dict[str, Any]]]:
        """Génère une réponse détaillée pour une formation spécifique."""
        reponse = f"📚 {formation_details['titre']}\n\n"
        reponse += f"⏱️ Durée : {formation_details['duree']}\n"
        reponse += f"💰 Prix : {formation_details['prix']}\n"
        reponse += f"📋 Prérequis : {formation_details['prerequis']}\n\n"
        reponse += "🎯 Programme :\n"
        for i, module in enumerate(formation_details['programme'], 1):
            reponse += f"{i}. {module}\n"
        reponse += f"\n🌿 Impact écologique : {formation_details['impact_ecologique']}\n"

        # Ajouter l'option de retour
        options = [{
            "id": "retour_formations",
            "label": "↩️ Retour aux formations",
            "type": "retour"
        }]

        return reponse, options

    def get_message_etape(self, etape: str) -> str:
        """Retourne le message associé à une étape."""
        return self.messages.get(etape, "Quelle est votre réponse ?")

    def get_formations_par_defaut(self) -> str:
        """Retourne une liste de formations par défaut en cas d'absence de recommandations."""
        formations_defaut = []
        for domaine, info in self.data['domaines'].items():
            formation = info['formations']['debutant']
            formations_defaut.append(f"🎓 {formation['titre']}\n📋 Durée : {formation['duree']}\n💰 Prix : {formation['prix']}\n")
        return "\n".join(formations_defaut) 