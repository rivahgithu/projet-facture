# Rapport des Réalisations Backend - Rivah Facture

Ce document détaille l'ensemble des travaux réalisés pour la mise en place du socle Backend de l'application **Rivah Facture**, conformément aux exigences du cahier des charges officiel.

> **Consigne respectée** : Aucun contrôleur n'a été créé lors de cette étape. L'accent a été mis exclusivement sur la modélisation des données, les migrations de base de données MySQL, les modèles Eloquent, les relations, les règles d'intégrité, les factories, les seeders et les tests automatisés.

---

## 1. Synthèse de l'Architecture de Données

Le schéma de données a été conçu pour respecter rigoureusement les règles métier du cahier des charges :
* **RB-01 à RB-04 (Calculs et précision monétaire)** : Types `DECIMAL(15, 2)` pour tous les montants et `DECIMAL(5, 2)` pour les taux de taxe et de remise, assurant une parfaite exactitude financière sans dérive de calcul flottant.
* **RB-05 (Numérotation unique)** : Contraintes d'unicité composites garantissant l'absence de collisions par entreprise (`[company_id, invoice_number]` et `[company_id, quote_number]`).
* **RB-06 & RB-07 (États documentaires et règlements)** : Séparation claire entre l'état documentaire (`document_status` : brouillon, émise, annulée) et l'état de règlement (`payment_status` : non_payée, partiellement_payée, payée, en_retard).
* **RB-08 & RB-09 (Soldes et échéances)** : Calcul dynamique et direct du solde restant dû (`balance_due = total - paid_total`), avec détection du retard de paiement (`is_overdue`).
* **RB-10 & RB-11 (Instantanés historiques et archivage souple)** : Les lignes de documents (`quote_items`, `invoice_items`) figent la désignation, les prix et les taux au moment de la facturation. L'archivage des clients et produits utilise un champ `archived_at` pour préserver l'intégrité des historiques financiers.
* **RB-12 (Isolation stricte)** : Toutes les entités principales (`clients`, `products`, `quotes`, `invoices`, `payments`, `activity_logs`) sont explicitement rattachées à une `company_id`.

---

## 2. Migrations Exécutées dans MySQL (`database/migrations/`)

Toutes les migrations suivantes ont été générées et exécutées avec succès sur la base de données MySQL `facture` :

| Fichier de migration | Table créée | Rôle & Caractéristiques clés |
| :--- | :--- | :--- |
| `2026_10_12_100001_create_companies_table.php` | `companies` | Profil de facturation : raison sociale, logo, devises (`FCFA`), délai de paiement (30 j), préfixes (`FACT-`, `DEV-`), identifiant fiscal (`tax_id`). |
| `2026_10_12_100002_create_company_user_table.php` | `company_user` | Table pivot multi-utilisateurs liant `users` et `companies` avec attribution de rôles (`owner`, `admin`, `member`) et contrainte d'unicité `[company_id, user_id]`. |
| `2026_10_12_100003_create_clients_table.php` | `clients` | Carnet d'adresses client rattaché à l'entreprise : nom, entreprise, téléphone, email, adresse, N° CC/IFU, notes et `archived_at`. Index sur `company_id`, `name`, `email`. |
| `2026_10_12_100004_create_products_table.php` | `products` | Catalogue de produits et prestations : référence, désignation, unité, prix unitaire HT (`DECIMAL(15,2)`), TVA (`DECIMAL(5,2)`), `is_active` et `archived_at`. |
| `2026_10_12_100005_create_quotes_table.php` | `quotes` | Propositions commerciales : numérotation unique par entreprise, statuts (`brouillon`, `envoyé`, `accepté`, `refusé`, `expiré`, `converti`), dates, totaux HT/TTC, clé de conversion vers facture. |
| `2026_10_12_100006_create_quote_items_table.php` | `quote_items` | Lignes de devis figées dans l'historique : désignation, quantité, unité, prix unitaire, remise (%), TVA (%), total de ligne, ordre de positionnement `position`. |
| `2026_10_12_100007_create_invoices_table.php` | `invoices` | Factures émises : dissociation état documentaire (`document_status`) / état de règlement (`payment_status`), total facturé, total encaissé (`paid_total`), dates d'émission et d'échéance. |
| `2026_10_12_100008_create_invoice_items_table.php` | `invoice_items` | Lignes de factures figées dans l'historique avec conservation des tarifs à l'instant T. Suppression en cascade lors des brouillons, préservation si archivage de produit. |
| `2026_10_12_100009_add_converted_invoice_id_to_quotes_table.php` | `quotes` (alter) | Clé étrangère liant un devis converti à sa facture correspondante (`converted_invoice_id` -> `invoices.id`) avec `nullOnDelete` sans dépendance circulaire. |
| `2026_10_12_100010_create_payments_table.php` | `payments` | **Règlements intégrés** à la facture (sans menu autonome) : montant encaissé, date, moyen (`espèces`, `virement`, `chèque`, `mobile_money`), référence, statut (`valid`, `cancelled`), utilisateur enregistreur. |
| `2026_10_12_100011_create_activity_logs_table.php` | `activity_logs` | Traçabilité et piste d'audit des actions sensibles : émission, annulation, conversion, enregistrement de règlement, avec métadonnées JSON et relation polymorphique. |

---

## 3. Modèles Eloquent & Relations (`app/Models/`)

Chaque modèle Eloquent a été implémenté avec typage PHP 8.3 strict, propriétés `$fillable`, méthodes de conversion de types `casts()`, relations bi-directionnelles, accesseurs et scopes métier :

### 1. `Company` ([app/Models/Company.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/Company.php))
* **Relations** :
  * `users()` : `BelongsToMany(User)` via table pivot `company_user` avec champ `role`.
  * `clients()` : `HasMany(Client)`
  * `products()` : `HasMany(Product)`
  * `quotes()` : `HasMany(Quote)`
  * `invoices()` : `HasMany(Invoice)`
  * `payments()` : `HasMany(Payment)`
  * `activityLogs()` : `HasMany(ActivityLog)`

### 2. `User` ([app/Models/User.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/User.php))
* **Relations** :
  * `companies()` : `BelongsToMany(Company)`
  * `recordedPayments()` : `HasMany(Payment)` (traçabilité de l'utilisateur ayant saisi le règlement)
  * `activityLogs()` : `HasMany(ActivityLog)`

### 3. `Client` ([app/Models/Client.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/Client.php))
* **Relations** :
  * `company()` : `BelongsTo(Company)`
  * `quotes()` : `HasMany(Quote)`
  * `invoices()` : `HasMany(Invoice)`
* **Accesseurs & Scopes** :
  * `isArchived` : Accesseur dynamique calculant l'état archivé depuis `archived_at`.
  * `scopeActive()` : Filtre les clients actifs non archivés.
  * `scopeArchived()` : Filtre les clients archivés.

### 4. `Product` ([app/Models/Product.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/Product.php))
* **Relations** :
  * `company()` : `BelongsTo(Company)`
  * `quoteItems()` : `HasMany(QuoteItem)`
  * `invoiceItems()` : `HasMany(InvoiceItem)`
* **Accesseurs & Scopes** :
  * `isArchived` : Détection de l'archivage.
  * `scopeActive()` : Articles disponibles à la vente (`is_active = true` et `archived_at is null`).
  * `scopeArchived()` : Articles archivés du catalogue.

### 5. `Quote` ([app/Models/Quote.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/Quote.php))
* **Relations** :
  * `company()` : `BelongsTo(Company)`
  * `client()` : `BelongsTo(Client)`
  * `items()` : `HasMany(QuoteItem)` ordonné par `position`.
  * `convertedInvoice()` : `BelongsTo(Invoice, 'converted_invoice_id')`
* **Scopes** :
  * `scopeStatus($query, $status)` : Filtrage par statut commercial.

### 6. `QuoteItem` ([app/Models/QuoteItem.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/QuoteItem.php))
* **Relations** :
  * `quote()` : `BelongsTo(Quote)`
  * `product()` : `BelongsTo(Product)` (nullable, pour préserver la ligne en cas de modification du catalogue).

### 7. `Invoice` ([app/Models/Invoice.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/Invoice.php))
* **Relations** :
  * `company()` : `BelongsTo(Company)`
  * `client()` : `BelongsTo(Client)`
  * `quote()` : `BelongsTo(Quote)` (optionnel, si issue d'une conversion de devis).
  * `items()` : `HasMany(InvoiceItem)` ordonné par `position`.
  * `payments()` : `HasMany(Payment)` ordonné par date de règlement antéchronologique.
* **Accesseurs Métier** :
  * `balanceDue` : Solde restant dû (`max(0, total - paid_total)`).
  * `isOverdue` : Vrai si émise, non soldée et dont la date d'échéance est dépassée.
* **Scopes** :
  * `scopeDocumentStatus()` : Brouillon, Émise, Annulée.
  * `scopePaymentStatus()` : Non payée, Partiellement payée, Payée, En retard.
  * `scopeOverdue()` : Extraction ciblée des factures en impayé après échéance.

### 8. `InvoiceItem` ([app/Models/InvoiceItem.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/InvoiceItem.php))
* **Relations** :
  * `invoice()` : `BelongsTo(Invoice)`
  * `product()` : `BelongsTo(Product)`

### 9. `Payment` ([app/Models/Payment.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/Payment.php))
* **Relations** :
  * `invoice()` : `BelongsTo(Invoice)`
  * `company()` : `BelongsTo(Company)`
  * `recordedBy()` : `BelongsTo(User, 'recorded_by')`
* **Scopes** :
  * `scopeValid()` : Règlements effectifs pris en compte dans le solde.
  * `scopeCancelled()` : Règlements annulés pour conservation de la trace d'audit.

### 10. `ActivityLog` ([app/Models/ActivityLog.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Models/ActivityLog.php))
* **Relations** :
  * `company()` : `BelongsTo(Company)`
  * `user()` : `BelongsTo(User)`
  * `subject()` : `MorphTo` polymorphique (`subject_type`, `subject_id`).

---

## 4. Factories & Seeders Réalistes (`database/factories/` & `database/seeders/`)

Afin d'assurer la validation du backend et les tests unitaires sans dépendre d'entrées manuelles :
* **Factories créées** :
  * `CompanyFactory`
  * `ClientFactory` (avec état `archived()`)
  * `ProductFactory` (avec état `inactive()`)
  * `QuoteFactory` (avec états `accepted()`, `converted()`)
  * `QuoteItemFactory`
  * `InvoiceFactory` (avec états `paid()`, `partiallyPaid()`)
  * `InvoiceItemFactory`
  * `PaymentFactory` (avec état `cancelled()`)
* **Seeder principal (`DatabaseSeeder.php`)** :
  * Initialise l'utilisateur démo (`contact@rivah.ci` / `password123`).
  * Crée l'agence émettrice **Rivah Digital Agency** avec les mentions légales ivoiriennes.
  * Peuple 6 clients réels (Bamba & Associés, Cabinet Dentaire Ivoire, TechSavvy Abidjan, etc.).
  * Peuple le catalogue complet de services numériques.
  * Génère des devis avec lignes, une conversion devis vers facture, des factures aux statuts variés (payée, partiellement payée avec solde calculé, facture en retard) et les règlements associés.
  * Enregistre les journaux d'activité initiaux.

---

## 5. Tests Automatisés & Validation

Un test fonctionnel complet a été rédigé et exécuté avec succès :
* **Fichier** : [`tests/Feature/ModelRelationshipsTest.php`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/tests/Feature/ModelRelationshipsTest.php)
* **Scénarios validés** :
  1. `test_company_has_users_clients_and_products` : Intégrité de l'entreprise, rôles pivots et catalogue.
  2. `test_quote_can_have_items_and_convert_to_invoice` : Lignes d'un devis et conversion sécurisée vers facture avec double liaison.
  3. `test_invoice_payments_and_balance_due_calculation` : Enregistrement de règlements successifs (acompte, solde), mise à jour du `paid_total`, et recalcul automatique du solde `balance_due`.
  4. `test_activity_log_polymorphic_relation` : Journalisation d'actions financières et relations polymorphiques.

* **Résultats des tests** :
  ```text
  Tests:    6 passed (24 assertions)
  Duration: 2.12s
  Status:   SUCCESS (100% OK)
  ```

* **Style et standard** :
  * Formatage validé avec **Laravel Pint**.

---

## 6. Prochaines Étapes pour le Backend

Lorsque vous validerez ce socle de données, les prochaines étapes consisteront à :
1. Développer les **Form Requests** de validation (sécurisation des saisies, contrôle des montants côté serveur).
2. Créer les **Services Métier** :
   * `NumberingService` : Génération atomique des numéros de facture et devis sans collision (`RB-05`).
   * `CalculationService` : Calcul rigoureux des lignes, remises, TVA et totaux côté serveur (`RB-01`).
   * `QuoteConversionService` : Conversion transactionnelle d'un devis accepté en facture (`RB-13`).
   * `PaymentService` : Enregistrement, vérification de non-dépassement du solde et mise à jour de la facture (`RB-08`).
3. Créer les **Policies & Gates** pour l'isolation stricte des données de l'entreprise (`RB-12`).
4. Créer les **Contrôleurs Inertia** reliant les vues React existantes aux données de la base de données.

---

## 7. Pages Frontend Réalisées (Accueil, Connexion & Inscription)

Conformément à la demande, les pages publiques d'accueil et d'authentification ont été conçues avec un niveau d'exigence visuelle élevé, adaptées au marché ivoirien et de l'Afrique de l'Ouest (FCFA) :

### A. Page d'Accueil (`resources/js/Pages/Welcome.tsx`)
* **Header & Navigation** : Logo officiel avec dégradé indigo, navigation avec ancres (`#features`, `#workflow`, `#pricing`, `#faq`) et boutons d'appel à l'action.
* **Hero Section Haute Fidélité** :
  * Titre percutant : *« Facturez en FCFA, encaissez sans délai, pilotez avec clarté »*.
  * Badges de réassurance : *100% FCFA*, *Sans carte bancaire*, *TVA 18% pré-configurée*.
  * Double CTA : Bouton d'inscription directe et bouton d'accès à la démo interactive.
  * **Mockup interactif** en direct présentant des KPI réels de l'agence démo et une facture acquittée avec virement bancaire.
* **Bandeau Public Cible** : Développeurs/freelances, agences de communication, consultants, PME de services.
* **Grille de Fonctionnalités** : 6 cartes avec icônes `lucide-react` et palettes de couleurs harmonieuses (devis, factures & règlements intégrés, PDF imprimable A4, carnet d'adresses client, catalogue de prestations, tableau de bord).
* **Cycle Commercial en 4 étapes** : Explication visuelle et chronologique du parcours de vente (Client -> Devis -> Facture émise -> Règlements).
* **Tarification Transparente** : Formule d'accès gratuit pour freelances et créateurs de projets.
* **Foire aux Questions (FAQ)** : Accordéon interactif expliquant notamment le choix ergonomique du règlement intégré sans menu Paiements autonome.
* **Pied de page** : Liens institutionnels, copyright Abidjan, Côte d'Ivoire.

### B. Page de Connexion (`resources/js/Pages/Auth/Login.tsx`)
* **Design Centré & Épuré** : Carte moderne centrée avec logo officiel Rivah Facture en en-tête.
* Champs Email, Mot de passe avec bouton pour afficher/masquer, case « Se souvenir de moi », et lien de mot de passe oublié.
* **Bouton Magique Compte Démo** : Un bouton permet de pré-remplir instantanément les identifiants de démonstration (`contact@rivah.ci` / `password123`) pour faciliter les tests et vos présentations.
* Liens vers la création de compte et retour à l'accueil.

### C. Page d'Inscription (`resources/js/Pages/Auth/Register.tsx`)
* **Design Centré & Épuré** : Suppression de la bannière latérale bleue pour un formulaire clair et aéré.
* Formulaire complet avec validation côté client (Nom complet, Raison sociale de l'entreprise/agence, Email professionnel, Téléphone, Mot de passe sécurisé et Confirmation, Acceptation des conditions).
* Liens directs vers la connexion et retour à l'accueil.

### D. Configuration du Routage Initial (`routes/web.php`)
* Route `/` : Affiche la page d'accueil (`Welcome`).
* Route `/login` : Affiche le formulaire de connexion (`Auth/Login`).
* Route `/register` : Affiche le formulaire d'inscription (`Auth/Register`).
* Route `/dashboard` : Affiche l'application de facturation interactive (`AppDashboard`).
* Route `/app` : Redirige vers `/dashboard`.
* Bouton « Déconnexion » de la barre latérale relié à `/login`.

---

## 8. Implémentation Complète des Contrôleurs & Services Métier

La couche applicative Backend (Contrôleurs, Services, Form Requests) a été entièrement développée et validée pour connecter l'interface aux tables de base de données :

### A. Services Métier Dédiés (`app/Services/`)
1. **`DocumentCalculationService`** ([app/Services/DocumentCalculationService.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Services/DocumentCalculationService.php)) :
   * Applique les règles `RB-01`, `RB-02` et `RB-04`.
   * Calcule avec rigueur monétaire pour chaque ligne : brut HT, remise (%), net HT, TVA (%) et total TTC.
   * Empêche toute manipulation de montants par le client navigateur.
2. **`DocumentNumberingService`** ([app/Services/DocumentNumberingService.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Services/DocumentNumberingService.php)) :
   * Applique la règle `RB-05` (numérotation atomique sans collision).
   * Génère les numéros uniques basés sur le préfixe de l'entreprise et l'année en cours (`FAC-2026-0001`, `DEV-2026-0001`).

### B. Form Requests de Validation (`app/Http/Requests/`)
* **`LoginRequest`** & **`RegisterRequest`** : Validation stricte des données d'authentification et unicité de l'email.
* **`ClientRequest`** : Validation des coordonnées, N° CC/IFU et notes du client.
* **`ProductRequest`** : Contrôle des prix unitaires positifs et taux de taxe applicables.
* **`QuoteRequest`** : Validation des dates d'émission/validité et du tableau d'articles.
* **`InvoiceRequest`** : Validation de la structure d'une facture directe.
* **`PaymentRequest`** : Validation du mode de paiement et des montants positifs.
* **`CompanyRequest`** : Validation des devises, délais de paiement et préfixes.

### C. Contrôleurs Développés (`app/Http/Controllers/`)
1. **`AuthController`** ([app/Http/Controllers/AuthController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/AuthController.php)) :
   * Inscription créant de façon transactionnelle l'utilisateur et son entreprise affiliée (`role = owner`).
   * Connexion sécurisée avec régénération de session (`session()->regenerate()`).
   * Déconnexion invalidant la session.
2. **`DashboardController`** ([app/Http/Controllers/DashboardController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/DashboardController.php)) :
   * Récupère en temps réel les données de l'entreprise active : clients avec totaux agrégés, catalogue produits, devis et factures avec leurs règlements.
   * Transmet les données formatées aux props d'`AppDashboard.tsx`.
3. **`ClientController`** ([app/Http/Controllers/ClientController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/ClientController.php)) :
   * Création, modification et archivage souple (`archived_at`) pour préserver l'historique financier (`RB-11`).
4. **`ProductController`** ([app/Http/Controllers/ProductController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/ProductController.php)) :
   * Ajout, modification et archivage d'articles du catalogue.
5. **`QuoteController`** ([app/Http/Controllers/QuoteController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/QuoteController.php)) :
   * Création et mise à jour de devis avec recalcul serveur et transaction (`RB-13`).
   * **Conversion en Facture** (`convert`) : Valide le devis, génère le numéro de facture, copie l'instantané des lignes et lie le devis à la facture (`RB-06`).
6. **`InvoiceController`** ([app/Http/Controllers/InvoiceController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/InvoiceController.php)) :
   * Création directe, mise à jour des brouillons et **procédure d'annulation contrôlée** (`RB-14`) avec trace d'audit.
7. **`InvoicePaymentController`** ([app/Http/Controllers/InvoicePaymentController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/InvoicePaymentController.php)) :
   * Enregistre un règlement partiel ou total depuis la facture (décision d'interface sans menu autonome).
   * Refuse tout montant nul, négatif ou supérieur au solde restant dû (`RB-08`).
   * Actualise le solde et le statut de paiement (`payée`, `partiellement_payée`).
   * Annulation de règlement avec traçabilité dans le journal d'activité.
8. **`CompanyController`** ([app/Http/Controllers/CompanyController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/CompanyController.php)) :
   * Mise à jour des informations d'agence, devise et préfixes de facturation.
9. **`ReportController`** ([app/Http/Controllers/ReportController.php](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/ReportController.php)) :
   * Export CSV des factures avec protection contre les injections de formules CSV (`RB-12`, 4.9).

### D. Validation par Tests Automatisés
* **Nouveau test d'intégration** : [`tests/Feature/ControllersIntegrationTest.php`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/tests/Feature/ControllersIntegrationTest.php)
* **Résultat d'exécution global** :
  ```text
  Tests:    13 passed (63 assertions)
  Duration: 6.73s
  Status:   100% SUCCESS
  ```
* Code formaté selon les normes **Laravel Pint**.

---

## 9. Liaison Complète Frontend <-> Backend Réalisée

Le pont direct entre l'interface utilisateur React et l'ensemble des routes et contrôleurs Laravel est désormais totalement actif :

1. **Injection des Données Réelles** :
   * [`DashboardController`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Controllers/DashboardController.php) alimente [`AppDashboard.tsx`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/resources/js/Pages/AppDashboard.tsx) avec les collections réelles de la base MySQL (`clients`, `products`, `quotes`, `invoices`, `company`).
   * Des hooks `useEffect` synchronisent dynamiquement l'état local dès qu'une visite Inertia rafraîchit les propriétés du composant.
2. **Formulaires Connectés aux Routes de Persistance** :
   * **Création & Modification de Facture** : Envoie une requête `router.post('/invoices')` ou `router.put('/invoices/{id}')`.
   * **Suppression / Annulation de Facture** : `router.delete('/invoices/{id}')` avec dialogue de confirmation.
   * **Enregistrement de Règlement** : `router.post('/invoices/{id}/payments')` avec mise à jour immédiate du solde et rafraîchissement du tiroir de détail.
   * **Création & Modification de Devis** : `router.post('/quotes')` et `router.put('/quotes/{id}')`.
   * **Conversion Devis vers Facture** : `router.post('/quotes/{id}/convert')` qui bascule automatiquement vers l'onglet Factures et ouvre la nouvelle facture créée.
   * **Clients & Catalogue Produits** : `router.post('/clients')` et `router.post('/products')`.
   * **Paramètres de l'Entreprise** : `router.put('/settings/company')`.
3. **Authentification Connectée** :
   * [`Login.tsx`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/resources/js/Pages/Auth/Login.tsx) : Soumet les identifiants via `router.post('/login')` avec gestion des erreurs de validation côté serveur.
   * [`Register.tsx`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/resources/js/Pages/Auth/Register.tsx) : Soumet l'inscription via `router.post('/register')` avec création automatique du compte et de son entreprise.
4. **Gestion des Notifications & Messages Flash** :
   * [`HandleInertiaRequests.php`](file:///c:/Users/yvesk/OneDrive/Desktop/laravel-facture/app/Http/Middleware/HandleInertiaRequests.php) partage les messages de session `flash.success` et `flash.error`.
   * Un bandeau de notification visuel s'affiche automatiquement en haut de l'application à chaque action réussie ou rejetée.



