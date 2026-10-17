# RIVAH FACTURE

<div align="center">
  <h3>Application Web de Gestion Commerciale et Facturation en FCFA</h3>
  <p>Conçue pour les freelances, prestataires de services, agences et PME en Côte d'Ivoire et Afrique de l'Ouest (UEMOA).</p>
</div>

---

## 🌟 Présentation

**Rivah Facture** est une application web moderne permettant de gérer l'intégralité du cycle commercial d'une entreprise :
* **Fichier Clients** : Gestion complète, coordonnées et suivi des créances par client.
* **Catalogue Produits & Services** : Tarifs unitaires, forfaits en FCFA et TVA 18%.
* **Devis Commerciaux** : Émission de devis conformes avec cadre d'accord et **conversion en facture en un clic**.
* **Factures & Règlements Intégrés** : Gestion directe des acomptes et soldes dans la fiche facture (**aucun menu Paiements autonome** imposé).
* **Impression & PDF A4** : Documents haute fidélité avec logo, mentions légales et cachet client.
* **Tableau de Bord & Analyses** : Chiffre d'affaires facturé, montants encaissés, impayés et graphiques mensuels.
* **Export CSV** : Export sécurisé avec protection contre les injections de formules.

---

## 🛠️ Stack Technique

* **Backend** : Laravel 12 / 13 (PHP 8.3)
* **Frontend** : React 19, TypeScript, Inertia.js v3
* **Styles & UI** : Tailwind CSS v4, Lucide React
* **Base de données** : MySQL 8 (InnoDB) avec types monétaires `DECIMAL(15, 2)`
* **Architecture** : Form Requests, Services métier (`DocumentCalculationService`, `DocumentNumberingService`), Relations Eloquent strictes

---

## 🚀 Installation & Démarrage Rapide

### 1. Prérequis
* PHP >= 8.3 avec extensions `pdo_mysql`, `mbstring`, `openssl`, `bcmath`
* Composer >= 2.x
* Node.js >= 20.x et npm
* Serveur MySQL (WampServer, XAMPP ou MySQL natif)

### 2. Cloner le projet et installer les dépendances
```bash
# Cloner le dépôt
git clone https://github.com/votre-compte/laravel-facture.git
cd laravel-facture

# Dépendances PHP
composer install

# Dépendances Frontend
npm install
```

### 3. Configuration de l'environnement
```bash
# Dupliquer le fichier d'exemple
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

Configurez vos identifiants MySQL dans le fichier `.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=facture
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrations et Données de Démonstration
```bash
# Créer les tables de base de données
php artisan migrate

# Peupler la base avec les données de démonstration (Rivah Digital Agency, clients, devis, factures)
php artisan db:seed
```

### 5. Compiler les assets et démarrer le serveur
```bash
# Compiler le frontend
npm run build

# Dans un terminal : démarrer le serveur de développement Laravel
php artisan serve

# Dans un second terminal (pour le Hot Reloading Vite en développement)
npm run dev
```

Rendez-vous sur [http://localhost:8000](http://localhost:8000).

---

## 🔐 Identifiants du Compte de Démonstration

L'application est pré-configurée avec un compte démo prêt à l'emploi :
* **URL** : `http://localhost:8000/login`
* **Email** : `contact@rivah.ci`
* **Mot de passe** : `password123`
*(Un bouton d'auto-remplissage rapide est disponible directement sur la page de connexion).*

---

## 🧪 Tests Automatisés

La suite de tests unitaires et fonctionnels valide l'ensemble des règles métier (`RB-01` à `RB-14`) :

```bash
php artisan test
```

Résultats :
* **13 tests fonctionnels réussis (63 assertions)**
* Couverture : Inscription, Connexion, CRUD Clients, CRUD Catalogue, Calculs de Devis, Conversion Devis vers Facture, Enregistrement de règlements partiels/totaux, Blocage en cas de dépassement du solde restant dû, Annulation contrôlée, Export CSV.

---

## 📄 Licence & Droits

Projet développé dans le cadre du portfolio professionnel **Rivah Facture**.
Tous droits réservés © 2026.
