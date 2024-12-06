// Objet pour stocker les titres et leurs tâches
let listeDesTitres = {}; 

// Sélection des éléments DOM principaux
// Récupère l'élément du formulaire pour ajouter un nouveau titre
const formulaireTitre = document.getElementById('formulaireTitre');

// Récupère l'élément du formulaire pour ajouter une nouvelle tâche
const formulaireTache = document.getElementById('formulaireTache');

// Champ d'entrée pour saisir un nouveau titre
const nouveauTitre = document.getElementById('nouveauTitre');

// Conteneur où seront affichés les titres créés par l'utilisateur
const listeTitres = document.getElementById('listeTitres');

// Bouton ou formulaire pour ajouter une nouvelle tâche
const ajoutTache = document.getElementById('ajoutTache');

// Champ d'entrée pour saisir une nouvelle tâche
const zoneDeSaisi = document.getElementById('zoneDeSaisi');

// Élement affichant le nombre total de tâches créées
const totalTaches = document.getElementById('totalTaches');

// Sélecteur de titre utilisé pour lier des tâches à un titre spécifique
const selectionTitre = document.getElementById('selectionTitre');

// Élément de la barre latérale (sidebar) utilisé pour la navigation ou les actions
const sidebar = document.querySelector('.sidebar');

// Bouton pour ouvrir la sidebar (menu sur les petits écrans)
const openMenu = document.getElementById('openMenu');

// Bouton pour fermer la sidebar (menu sur les petits écrans)
const closeMenu = document.getElementById('closeMenu');


// Ouvrir la sidebar
openMenu.addEventListener('click', () => {
    sidebar.classList.add('active'); // Affiche la sidebar
    openMenu.style.display = 'none'; // Cache le bouton "open"
    closeMenu.style.display = 'block'; // Affiche le bouton "close"
});

// Fermer la sidebar
closeMenu.addEventListener('click', () => {
    sidebar.classList.remove('active'); // Cache la sidebar
    closeMenu.style.display = 'none'; // Cache le bouton "close"
    openMenu.style.display = 'block'; // Affiche le bouton "open"
});


// Variable pour suivre le titre actuellement sélectionné
let titreActif = null; 

// Gestionnaire d'événement pour la création de nouveaux titres
formulaireTitre.addEventListener('submit', (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page

    // Nettoyer et valider le titre
    const titre = nouveauTitre.value.trim();

    // Vérifier que le titre n'est pas vide et n'existe pas déjà
    if (titre && !listeDesTitres[titre]) {
        // Initialiser un tableau vide pour les tâches de ce titre
        listeDesTitres[titre] = [];

        // Créer l'élément de titre dans la sidebar
        const element = document.createElement('div');
        element.textContent = titre;
        element.className = "titre";

        // Ajouter un compteur de tâches
        const span = document.createElement('span');
        span.classList.add('statistiques');
        span.innerText = '0';
        element.appendChild(span);

        // Créer un bouton de suppression pour le titre
        const bouton = document.createElement('button');
        bouton.innerText = "Supprimer";
        bouton.classList.add('supprimer-titre');
        bouton.onclick = function () {
            // Supprimer complètement le titre et ses tâches
            delete listeDesTitres[titre];
            element.remove();
            
            // Réinitialiser la vue si le titre supprimé était actif
            if (titreActif === titre) {
                titreActif = null;
                ajoutTache.innerHTML = '';
            }
            
            // Mettre à jour les statistiques
            mettreAJourStatistiques();
        };
        element.appendChild(bouton);

        // Ajouter un gestionnaire de sélection de titre
        element.addEventListener('click', () => selectionnerTitre(titre, element));

        // Ajouter le titre à la liste des titres
        listeTitres.appendChild(element);

        // Réinitialiser le formulaire
        formulaireTitre.reset();
    } else if (listeDesTitres[titre]) {
        alert("Ce titre existe déjà !");
    }
});

// Fonction pour sélectionner un titre
function selectionnerTitre(titre, element) {
    // Désélectionner tous les autres titres
    document.querySelectorAll('.titre').forEach(el => {
        el.classList.remove('titre-selectionne');
    });

    selectionTitre.textContent = `Titre ${titre}`;
    // Sélectionner le nouveau titre
    element.classList.add('titre-selectionne');
    titreActif = titre;

    // Afficher les tâches du titre sélectionné
    afficherTaches();
}

// Fonction pour vérifier si une tâche existe déjà dans n'importe quel titre
function verifierTacheUnique(tache) {
    // Parcourir tous les titres
    for (let titre in listeDesTitres) {
        // Vérifier si la tâche existe dans un des titres
        if (listeDesTitres[titre].some(t => t.texte.toLowerCase() === tache.toLowerCase())) {
            return false; // Tâche déjà existante
        }
    }
    return true; // Tâche unique
}

// Gestionnaire d'ajout de tâche
formulaireTache.addEventListener('submit', (e) => {
    e.preventDefault();
    ajouterTache();
});

function ajouterTache() {
    // Vérifier qu'un titre est sélectionné
    if (!titreActif) {
        alert("Veuillez sélectionner un titre d'abord !");
        return;
    }

    // Nettoyer et valider la tâche
    const nouvelleTache = zoneDeSaisi.value.trim();
    if (!nouvelleTache) {
        return;
    }

    // Vérifier la sélection de catégorie
    const choixImportant = document.getElementById('important').checked;
    const choixUrgent = document.getElementById('urgent').checked;

    if (!choixImportant && !choixUrgent) {
        return;
    }

    

    // Vérifier l'unicité de la tâche dans TOUS les titres
    if (!verifierTacheUnique(nouvelleTache)) {
        alert("Cette tâche existe déjà dans un autre titre !");
        return;
    }
    

    // Vérifier que la tâche n'existe pas déjà dans ce titre
    if (listeDesTitres[titreActif].some(tache => tache.texte.toLowerCase() === nouvelleTache.toLowerCase())) {
        alert("Cette tâche existe déjà dans ce titre !");
        return;
    }

    // Ajouter la nouvelle tâche au titre actif
    listeDesTitres[titreActif].push({
        texte: nouvelleTache,
        important: choixImportant,
        urgent: choixUrgent
    });

    // Réinitialiser le formulaire
    zoneDeSaisi.value = '';
    document.getElementById('important').checked = false;
    document.getElementById('urgent').checked = false;

    // Afficher les tâches et mettre à jour les statistiques
    afficherTaches();
    mettreAJourStatistiques();
}

// Fonction pour afficher les tâches du titre actif
function afficherTaches() {
    // Vider le conteneur des tâches
    ajoutTache.innerHTML = '';

    // Vérifier qu'un titre est sélectionné
    if (!titreActif) return;

    // Afficher les tâches du titre actif
    listeDesTitres[titreActif].forEach((tache, index) => {
        // Créer un conteneur pour la tâche
        const divTache = document.createElement('div');
        divTache.className = 'tache';

        // Créer le paragraphe de la tâche
        const paragraphe = document.createElement('p');
        paragraphe.innerText = tache.texte;
        
        // Appliquer le style selon la catégorie
        if (tache.urgent) {
            paragraphe.classList.add('paragraphe_urgent');
        } else if (tache.important) {
            paragraphe.classList.add('paragraphe_important');
        }

        // Créer un conteneur pour les boutons
        const divBtn = document.createElement('div');
        divBtn.className = 'div_btn';

        // Bouton Modifier
        const boutonModifier = document.createElement('button');
        boutonModifier.innerText = 'Modifier';
        boutonModifier.className = 'btn1';
        boutonModifier.onclick = () => modifierTache(tache, paragraphe, index);

        // Bouton Supprimer
        const boutonSupprimer = document.createElement('button');
        boutonSupprimer.className = 'btn2';
        boutonSupprimer.innerText = 'Supprimer';
        boutonSupprimer.onclick = () => supprimerTache(index);

        // Rendre la tâche cliquable pour la barrer
        paragraphe.onclick = () => {
            paragraphe.style.textDecoration = 
                paragraphe.style.textDecoration === "line-through" ? "none" : "line-through";
        };


        // Assembler les éléments de la tâche
        divTache.appendChild(paragraphe);
        divBtn.appendChild(boutonModifier);
        divBtn.appendChild(boutonSupprimer);
        divTache.appendChild(divBtn);
        ajoutTache.appendChild(divTache);
    });
}

// Fonction pour modifier une tâche
function modifierTache(tache, paragraphe, index) {
    paragraphe.contentEditable = true;
    paragraphe.focus();

    paragraphe.onkeydown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const nouvelleValeur = paragraphe.innerText.trim();
            
            // Vérifier que la nouvelle valeur n'est pas vide
            if (!nouvelleValeur) {
                paragraphe.innerText = tache.texte;
                paragraphe.contentEditable = false;
                return;
            }

            // Vérifier que la nouvelle valeur est différente
            if (nouvelleValeur !== tache.texte) {
                // Vérifier l'unicité de la nouvelle tâche
                if (!verifierTacheUnique(nouvelleValeur)) {
                    alert("Cette tâche existe déjà!");
                    paragraphe.innerText = tache.texte;
                } else {
                    // Vérifier qu'elle n'existe pas déjà dans ce titre
                    const tacheExistante = listeDesTitres[titreActif].some(
                        (t, i) => i !== index && t.texte.toLowerCase() === nouvelleValeur.toLowerCase()
                    );

                    if (tacheExistante) {
                        alert("Cette tâche existe déjà!");
                        paragraphe.innerText = tache.texte;
                    } else {
                        // Mettre à jour la tâche
                        listeDesTitres[titreActif][index].texte = nouvelleValeur;
                    }
                }
            }

            paragraphe.contentEditable = false;
            mettreAJourStatistiques();
            afficherTaches();
        }
    };
}
// Fonction pour supprimer une tâche
function supprimerTache(index) {
    // Supprimer la tâche du titre actif
    listeDesTitres[titreActif].splice(index, 1);
    
    // Réafficher les tâches et mettre à jour les statistiques
    afficherTaches();
    mettreAJourStatistiques();
}

// Fonction pour mettre à jour les statistiques des titres
function mettreAJourStatistiques() {
    let totalTachesCount = 0;
    
    // Mettre à jour le nombre de tâches pour chaque titre
    Object.keys(listeDesTitres).forEach(titre => {
        // Trouver l'élément du titre dans la sidebar
        const titreElement = Array.from(listeTitres.children).find(el => 
            el.textContent.startsWith(titre)
        );
        
        if (titreElement) {
            // Mettre à jour le compteur de tâches
            const spanStatistiques = titreElement.querySelector('.statistiques');
            const nombreTaches = listeDesTitres[titre].length;
            spanStatistiques.innerText = ` (${nombreTaches})`;
            totalTachesCount += nombreTaches;
        }
    });

    // Mettre à jour le total des tâches
    totalTaches.innerText = totalTachesCount;
}

// Initialisation des statistiques au chargement
mettreAJourStatistiques();


