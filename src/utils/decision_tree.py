import json
import re
from typing import Dict, List, Optional, Tuple

class DecisionTree:
    def __init__(self, intent_file: str = 'src/data/intent.json'):
        with open(intent_file, 'r', encoding='utf-8') as f:
            self.intents = json.load(f)['intents']
        
    def _match_patterns(self, message: str, patterns: List[str]) -> bool:
        """Vérifie si le message correspond à l'un des patterns."""
        message = message.lower()
        return any(pattern.lower() in message for pattern in patterns)
    
    def _get_domaine(self, message: str) -> Optional[Tuple[str, Dict]]:
        """Identifie le domaine de formation à partir du message."""
        for domaine, info in self.intents['domaines'].items():
            if self._match_patterns(message, info['patterns']):
                return domaine, info
        return None
    
    def _get_niveau(self, message: str) -> str:
        """Détermine le niveau de l'utilisateur."""
        patterns = self.intents['niveau']['patterns']
        if self._match_patterns(message, patterns['debutant']):
            return 'debutant'
        elif self._match_patterns(message, patterns['intermediaire']):
            return 'intermediaire'
        return 'debutant'  # Par défaut
    
    def _get_question_type(self, message: str) -> Optional[Tuple[str, Dict]]:
        """Identifie le type de question posée."""
        for qtype, info in self.intents['questions'].items():
            if self._match_patterns(message, info['patterns']):
                return qtype, info
        return None
    
    def process_message(self, message: str, context: Dict = None) -> str:
        """Traite le message et retourne une réponse appropriée."""
        if context is None:
            context = {}
        
        # Vérifier les salutations
        if self._match_patterns(message, self.intents['salutation']['patterns']):
            return self.intents['salutation']['responses'][0]
        
        # Vérifier les au revoir
        if self._match_patterns(message, self.intents['au_revoir']['patterns']):
            return self.intents['au_revoir']['responses'][0]
        
        # Identifier le domaine
        domaine_info = self._get_domaine(message)
        if domaine_info:
            domaine, info = domaine_info
            niveau = self._get_niveau(message)
            formation = info['formations'][niveau]
            
            # Construire la réponse détaillée
            response = f"Voici les détails de la {formation['titre']} :\n\n"
            response += f"📚 Durée : {formation['duree']}\n"
            response += f"💰 Prix : {formation['prix']}\n"
            response += f"📋 Prérequis : {formation['prerequis']}\n\n"
            response += "🎯 Programme :\n"
            for i, module in enumerate(formation['programme'], 1):
                response += f"{i}. {module}\n"
            
            return response
        
        # Identifier le type de question si un contexte de formation existe
        if 'formation_courante' in context:
            question_info = self._get_question_type(message)
            if question_info:
                qtype, info = question_info
                formation = context['formation_courante']
                return info['response'].format(
                    formation=formation['titre'],
                    duree=formation['duree'],
                    prix=formation['prix'],
                    prerequis=formation['prerequis'],
                    programme="\n".join(f"- {p}" for p in formation['programme'])
                )
        
        # Réponse par défaut
        return ("Je ne suis pas sûr de comprendre votre demande. "
                "Pouvez-vous préciser si vous cherchez une formation en :\n"
                "- Développement Web\n"
                "- Data Science\n"
                "- Développement Mobile")

    def get_formations_disponibles(self) -> str:
        """Retourne la liste des formations disponibles."""
        response = "Voici les formations disponibles :\n\n"
        for domaine, info in self.intents['domaines'].items():
            response += f"🎓 {domaine.upper()} :\n"
            for niveau, formation in info['formations'].items():
                response += f"- {formation['titre']}\n"
                response += f"  Durée : {formation['duree']} | Prix : {formation['prix']}\n"
            response += "\n"
        return response 