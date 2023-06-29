require('dotenv').config({ path: './passwordhide/password.env' });

const dbPassword = process.env.DB_PASSWORD;
const express = require("express");
const mysql = require('mysql2')
const app = express();
const cors = require("cors");
const multer = require('multer'); // Middleware pour gérer les téléchargements de fichiers


app.use(cors());

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: dbPassword,
  database: "marquise",
});
//Connection a la base de donnée
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
});

app.get("/utilisateurs", (req, res, next) => {
  connection.query(
    "SELECT * FROM utilisateurs",
    function (error, results, fields) {
      if (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs :",
          error
        );
        res
          .status(500)
          .json({ error: "Erreur lors de la récupération des utilisateurs" });
      } else {
        const jsonResults = JSON.parse(JSON.stringify(results));
        res.json(jsonResults);
      }
    }
  );
});

app.get("/produits", (req, res, next) => {
  connection.query("SELECT * FROM produits", function (error, results, fields) {
    if (error) {
      console.error("Erreur lors de la récupération des produits :", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des produits" });
    } else {
      const jsonResults = JSON.parse(JSON.stringify(results));
      res.json(jsonResults);
    }
  });
});

// Ajouter un produit à la base de donnée
app.post("/produits", (req, res, next) => {
  connection.query(
    "INSERT INTO produits (nom, description, prix, stock, date) VALUES ('abc', 'descript', 123, 0, '12/12/2022')",
    function (error, results, fields) {
      if (error) {
        console.error("Erreur lors de l'insertion des produits :", error);
        res
          .status(500)
          .json({ error: "Erreur lors de l'insertion des produits" });
      } else {
        res.json(results);
      }
    }
  );
});
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Configuration de Multer pour spécifier où les fichiers doivent être stockés
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../images');
  }
});


const upload = multer({ storage: storage });

app.post('/produits', upload.single('imageFile'), (req, res) => {
  if (!req.file) {
    res.status(400).send('Aucun fichier n\'a été téléchargé.');
    return;
  }

  const filePath = req.file.path;

  // Enregistrement du chemin d'accès à l'image dans la base de données
  const query = "INSERT INTO produits (photo) VALUES ('filePath')";
  connection.query(query, [filePath], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement du chemin d\'accès à l\'image dans la base de données :', err);
      res.status(500).send('Une erreur s\'est produite lors du traitement de la requête.');
      return;
    }

    // Le fichier a été téléchargé et enregistré avec succès dans la base de données
    res.send('Le fichier a été téléchargé et enregistré.');
  });
});

// app.post("/api/stuff", (req, res, next) => {
//   console.log(req.body);
//   res.status(201).json({
//     message: "objet créé",
//   });
// });

module.exports = app;
