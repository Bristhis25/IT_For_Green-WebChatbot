# Installation et lancement

### Prérequis

- Node.js (v16+)
- npm (ou yarn)
- Python 3.8+
- pip

---

### 1. Cloner le dépôt

```bash
git clone https://server-rtit-consulting.com/learnia/ChatbotLearnIA.git
cd it-for-green_landingPage
```

---

### 2. Lancer le back-end Flask

```bash
cd server
python -m venv venv
source venv/bin/activate         # sous Windows : venv\Scripts\activate
pip install -r requirements.txt
flask run
```

- Le serveur est disponible sur `http://localhost:5000`
- Crée un fichier `.env` (présent dans le zip)

---

### 3. Lancer le front-end React

```bash
cd client
npm install
npm start
```

- L'application React sera accessible via `http://localhost:3000`

---

##  Scripts disponibles



| Script        | Description                    |
|---------------|--------------------------------|
| `npm start`   | Démarre le serveur de dev React |
| `npm run build` | Crée une version de prod      |
| `npm test`    | Lance les tests                |



| Commande             | Description                        |
|----------------------|------------------------------------|
| `python src/backend/app.py` | Démarre le serveur Flask     |
| `source venv/bin/activate` | Active l'environnement virtuel |

