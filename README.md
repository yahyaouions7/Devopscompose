# Gestion des voitures (CRUD) — Node.js + React + MongoDB

## Fonctionnalités
- Login (JWT) — compte par défaut : `admin` / `admin123`
- Ajouter / Modifier (nom, prix, marque, année, description) / Supprimer une voiture
- Upload de plusieurs images par voiture (ajout et suppression des images en modification)
- Recherche par nom ou marque
- La liste est publique, mais Ajouter / Modifier / Supprimer demandent d'être connecté

## Prérequis
- Node.js 18+
- MongoDB (MongoDB Compass connecté à `mongodb://127.0.0.1:27017`)

## Lancer le backend
```bash
cd backend
npm install
npm start
```
Le serveur tourne sur http://localhost:5000, la base `carsdb` est créée automatiquement
(visible dans Compass) et le compte admin est créé au premier lancement.
Les variables sont dans `backend/.env`.

## Lancer le frontend
```bash
cd frontend
npm install
npm run dev
```
Ouvrir http://localhost:5173

## API
| Méthode | URL | Accès |
|---|---|---|
| POST | /api/auth/login | public |
| GET | /api/cars?search= | public |
| GET | /api/cars/:id | public |
| POST | /api/cars | login (multipart: name, brand, price, year, description, images[]) |
| PUT | /api/cars/:id | login (+ removeImages = JSON array) |
| DELETE | /api/cars/:id | login |
# Devopscompose
# Devopscompose
# Devopscompose
