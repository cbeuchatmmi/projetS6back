const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser'); // for parsing JSON requests

const cors = require('cors')

const app = express();
const port = 4000;


// Middleware for parsing JSON requests
app.use(bodyParser.json());
// Enable Cors from all origins
app.use(cors())

// Créez une instance de la base de données SQLite
const db = new sqlite3.Database('game.db');

// afficher les scores
app.get('/score', (req, res) => {
    const query = `
        SELECT s.*, c.user_name
        FROM SCORE s
        LEFT JOIN  CONNEXION c ON s.user_id = c.user_id
    `;
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ games: rows });
    });
});



// Route pour ajouter un nouvel CONNEXION
app.post('/score/add', (req, res) => {
    const { score_id, score_time, user_id, level_id } = req.body;

    // Vérifiez si toutes les informations nécessaires sont fournies
    if (!score_time || !user_id || !level_id) {
        res.status(400).json({ error: 'Toutes les informations nécessaires doivent être fournies' });
        return;
    }

    // Insérez le nouvel CONNEXION dans la table CONNEXION
    const query = `
        INSERT INTO SCORE (score_id, score_time, user_id, level_id )
        VALUES (?, ?, ?, ?)
    `;

    const values = [score_id, score_time, user_id, level_id];

    db.run(query, values, (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'CONNEXION:', err.message);
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }

        // Retournez le nouvel CONNEXION ajouté avec son ID
        res.json({ score_id: this.lastID, score_time, user_id, level_id });
    });
});

// Route pour ajouter un nouvel CONNEXION
app.post('/user/add', (req, res) => {
    const { user_id, user_name, user_mdp } = req.body;

    // Vérifiez si toutes les informations nécessaires sont fournies
    if (!user_name || !user_mdp) {
        res.status(400).json({ error: 'Toutes les informations nécessaires doivent être fournies' });
        return;
    }

    // Insérez le nouvel CONNEXION dans la table CONNEXION
    const query = `
        INSERT INTO CONNEXION (user_id, user_name, user_mdp)
        VALUES (?, ?, ?)
    `;

    const values = [user_id, user_name, user_mdp];

    db.run(query, values, (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'CONNEXION:', err.message);
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }

        // Retournez le nouvel CONNEXION ajouté avec son ID
        res.json({ user_id: this.lastID, user_name });
    });
});

// Route pour vérifier si un nom d'utilisateur existe
app.get('/user/exists/:username', (req, res) => {
    const username = req.params.username;

    // Vérifiez si le nom d'utilisateur existe dans la base de données
    const query = 'SELECT COUNT(*) AS count FROM CONNEXION WHERE user_name = ?';
    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'existence du nom d\'utilisateur :', err.message);
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }

        // Si le compteur est supérieur à zéro, cela signifie que le nom d'utilisateur existe déjà
        const exists = row.count > 0;
        res.json({ exists });
    });
});


app.post('/level/add', (req, res) => {
    const { level_id, level_libelle } = req.body;

    // Vérifiez si toutes les informations nécessaires sont fournies
    if (!level_libelle) {
        res.status(400).json({ error: 'Toutes les informations nécessaires doivent être fournies' });
        return;
    }

    // Insérez le nouvel CONNEXION dans la table CONNEXION
    const query = `
        INSERT INTO LEVEL (level_id, level_libelle)
        VALUES (?, ?)
    `;

    const values = [level_id, level_libelle];

    db.run(query, values, (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'CONNEXION:', err.message);
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }

        // Retournez le nouvel CONNEXION ajouté avec son ID
        res.json({ level_id: this.lastID, level_libelle });
    });
});

// Route pour gérer la connexion
app.post('/login', (req, res) => {
    const { user_name, user_mdp } = req.body;

    // Vérifiez si toutes les informations nécessaires sont fournies
    if (!user_name || !user_mdp) {
        res.status(400).json({ error: 'Toutes les informations nécessaires doivent être fournies' });
        return;
    }

    // Vérifiez les informations d'identification dans la base de données
    const query = 'SELECT * FROM CONNEXION WHERE user_name = ? AND user_mdp = ?';

    db.get(query, [user_name, user_mdp], (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification des informations d\'identification :', err.message);
            res.status(500).json({ error: 'Erreur interne du serveur' });
            return;
        }

        if (!row) {
            // Aucun CONNEXION trouvé avec ces informations d'identification
            res.status(401).json({ error: 'Connexion échouée. Vérifiez vos informations d\'identification' });
            return;
        }

        // Connexion réussie
        res.json({ message: 'Connexion réussie', user: { user_id: row.user_id, user_name: row.user_name } });
    });
});


// Écoutez le port défini
app.listen(port, () => {
    console.log(`Serveur API en cours d'exécution sur le port ${port}`);
});