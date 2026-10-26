# UnityQuest — édition locale

Cette version désactive Supabase et les connexions cloud. Le pseudo et la progression sont conservés dans le stockage du navigateur.

Le menu et la victoire proposent le partage du score avec un mouton et un message aléatoires. « Autre mouton » change la variante. Le partage natif est utilisé si disponible ; sinon le texte peut être copié. Aucun score n’est publié automatiquement.

## Lancement sous Windows

Installer Node.js puis, depuis le dossier du projet :

    npm install
    npm start

Ouvrir http://localhost:3000. Pour compiler : npm run build.

Les contenus audio distants du projet d’origine peuvent encore nécessiter Internet. La sauvegarde du site GitHub Pages n’est pas transférée automatiquement à localhost : utiliser les fonctions d’export/import du jeu.

## Vérification dans cette session

Les modifications ont été examinées et contrôlées avec git diff. Le lancement et la compilation restent à vérifier : npm install échoue sous Windows avec EPERM lors de la création de sous-dossiers node_modules.

## Contrôle complémentaire du cloud

Deux pages annexes (emmanuel-artist-module.html et emmanuel-artist-moduletest.html) créaient encore un client Supabase indépendant. Ces connexions ont été retirées ; les pages affichent maintenant la progression locale réelle, sans scores de secours inventés. L’ancien export de session et l’import depuis la production sont désactivés. Le workflow ne transmet plus les variables Supabase ; le script de configuration distante est neutralisé.

Vérifications automatisées réussies : client principal nul ; six opérations d’authentification distante refusées ; absence de client et d’adresse Supabase dans les pages publiques ; syntaxe des scripts HTML ; lecture du score local (321 points), du niveau et de la sagesse ; gestion d’une sauvegarde absente ou invalide ; absence de script dans l’ancien exporteur.

Les références anciennes dans les traductions, la documentation et les branches cloud inaccessibles ne créent aucune connexion. La dépendance Supabase reste dans le manifeste mais n’est plus importée par un code créant un client.

Ce contrôle porte sur la copie locale. Le service Supabase distant et le site GitHub Pages n’ont pas été modifiés. Le lancement complet reste non vérifié à cause de l’erreur npm EPERM signalée plus haut.

## Nouvelle page artiste

La page artiste est entièrement refaite : présentation Emmanuel Payet, quatre liens de création conservés, tableau de progression personnel (score, sagesse, révélations, XP, étoiles, niveaux débloqués), mouton et messages aléatoires, partage volontaire et actualisation entre onglets. Les 17 langues du jeu sont disponibles. Les anciennes adresses artiste de test redirigent vers la page principale.

Aucune police distante, aucun classement mondial, aucune requête automatique vers un service cloud. Les chiffres proviennent exclusivement de faithChroniclesProgress sur la même origine que le jeu. Une sauvegarde absente ou illisible est signalée ; aucun résultat n’est inventé.

La page peut être servie directement sans npm : HTML, CSS et JavaScript autonomes. Vérification visuelle effectuée dans le navigateur sur ordinateur et mobile. Tests des données et interactions réussis, y compris refus ou annulation du partage. La compilation du jeu React complet reste à vérifier séparément.

Le jeu ouvre désormais directement le menu principal, sans écran de connexion, inscription ni saisie de pseudo obligatoire. Le pseudo existant est conservé ; sinon « Joueur local » est utilisé et peut être modifié dans le profil. Les données de progression restent en place.

Menu du profil simplifié : pseudo modifiable et choix de langue uniquement ; suppression des actions et indicateurs cloud, de connexion et de déconnexion. La sauvegarde automatique locale du jeu reste active.

## Traductions des modifications

Toutes les nouveautés sont désormais traduites dans les 17 langues du jeu : français, anglais, espagnol, allemand, italien, portugais, russe, ukrainien, chinois, japonais, coréen, arabe, hébreu, hindi, polonais, swahili et lingala. Cela inclut la page artiste complète, Suno, les mots du logo, les deux nouvelles phrases, les moutons, le score partagé, les messages de statut et le menu du pseudo.

La page artiste respecte la langue transmise par le jeu. L’arabe et l’hébreu utilisent le sens de lecture de droite à gauche. Les nombres sont formatés dans la langue choisie. Les pseudos personnels restent tels que leurs utilisateurs les ont saisis.

Source commune : src/data/localTranslations.json. Après modification, lancer npm run sync:local-translations pour mettre à jour le fichier public autonome. Vérification sans installation de dépendances : npm run test:local-translations (ou node scripts/test-local-translations.mjs). Les 17 langues ont aussi été parcourues dans le navigateur ; aucun texte ajouté n’y est vide.

Le compagnon est désormais un mouton kawaii dessiné en SVG local, assis sur un nuage de cœurs. Quatre couleurs et expressions sont choisies au hasard sans répétition immédiate. Les mêmes dessins sont utilisés par le jeu et la page artiste ; aucun téléchargement externe n’est nécessaire.
