const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const app = express();

// Configuration du body-parser pour gérer les requêtes POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuration de la connexion à la base de données PostgreSQL
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: 'password',
  port: 5432
});

// Route pour la création d'un compte utilisateur
app.post('/register', (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    } else {
      pool.query('INSERT INTO users (name, password) VALUES ($1, $2)', [name, hash], (error, results) => {
        if (error) {
          return res.status(500).json({
            error: error
          });
        } else {
          res.status(201).json({
            message: 'User created'
          });
        }
      });
    }
  });
});

// Route pour la connexion de l'utilisateur
app.post('/login', (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  pool.query('SELECT * FROM users WHERE name = $1', [name], (error, results) => {
    if (error) {
      return res.status(401).json({
        message: 'Auth failed'
      });
    }
    if (results.rows.length > 0) {
      bcrypt.compare(password, results.rows[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          });
        }
        if (result) {
          return res.status(200).json({
            message: 'Auth successful'
          });
        }
        return res.status(401).json({
          message: 'Auth failed'
        });
      });
    } else {
      return res.status(401).json({
        message: 'Auth failed'
      });
    }
  });
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
