# Explication de la Propriété de Pythagore (Programme de 3ᵉ en Afrique de l'Ouest)

La propriété de Pythagore est un théorème fondamental en géométrie qui s'applique uniquement aux triangles rectangles. Elle permet de calculer la longueur d'un côté lorsque les deux autres sont connus.

## Énoncé du Théorème de Pythagore

Dans un triangle rectangle :

« Le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés. »

- **Hypoténuse** : C'est le côté opposé à l'angle droit (le plus long côté du triangle rectangle).
- **Côtés de l'angle droit** : Ce sont les deux côtés qui forment l'angle droit.

## Formule Mathématique

Si on note :
- $(AB)$ = hypoténuse,
- $(AC)$ et $(BC)$ = côtés de l'angle droit,

alors : $$\\boxed{AB^{2} = AC^{2} + BC^{2}}$$

## Exemple d'Application

Soit un triangle $(ABC)$ rectangle en $(C)$ avec :
- $(AC = 3)$ cm,
- $(BC = 4)$ cm.

Calculons $(AB)$ : 
$$AB^{2} = AC^{2} + BC^{2} = 3^{2} + 4^{2} = 9 + 16 = 25$$
$$AB = \\sqrt{25} = 5 \\text{ cm}$$

## Cas Particuliers (À Connaître en 3ᵉ)

### Triangle rectangle isocèle (deux côtés égaux)
Si $(AC = BC = a)$, alors :
$$AB^{2} = a^{2} + a^{2} = 2a^{2} \\implies AB = a\\sqrt{2}$$

### Triangle "3-4-5"
Un triangle rectangle dont les côtés mesurent $(3)$, $(4)$ et $(5)$ vérifie :
$$5^{2} = 3^{2} + 4^{2} \\quad (25 = 9 + 16)$$

## Réciproque du Théorème de Pythagore

« Si dans un triangle, le carré d'un côté est égal à la somme des carrés des deux autres côtés, alors ce triangle est rectangle. »

**Exemple** : Un triangle $(DEF)$ a pour côtés $(DE = 6)$ cm, $(EF = 8)$ cm et $(DF = 10)$ cm.

Vérifions : 
$$10^{2} = 6^{2} + 8^{2} \\implies 100 = 36 + 64 \\implies 100 = 100$$

Donc $(DEF)$ est rectangle en $(E)$.

## Application à la Figure de la Question (Partie 1)

**Figure** : Un repère orthonormé avec des points $(O, A, B, C, D, E)$ tels que $(OA = 1)$ unité (par exemple).

**Objectif** : Calculer $(AB^{2}, AC^{2}, AD^{2}, AE^{2})$ en utilisant Pythagore.

### Méthode

1. **Repérer les coordonnées** :
   - Supposons que $(O)$ est l'origine $((0;0))$,
   - $(A)$ est en $((1;0))$,
   - $(B)$ en $((1;1))$,
   - $(C)$ en $((0;1))$,
   - $(D)$ en $((-1;1))$,
   - $(E)$ en $((-1;0))$.

2. **Calculer les distances** :
   - $(AB)$ : Entre $(A(1;0))$ et $(B(1;1))$.
     $$AB^{2} = (1-1)^{2} + (1-0)^{2} = 0 + 1 = 1$$
   
   - $(AC)$ : Entre $(A(1;0))$ et $(C(0;1))$.
     $$AC^{2} = (0-1)^{2} + (1-0)^{2} = 1 + 1 = 2$$
   
   - $(AD)$ : Entre $(A(1;0))$ et $(D(-1;1))$.
     $$AD^{2} = (-1-1)^{2} + (1-0)^{2} = 4 + 1 = 5$$
   
   - $(AE)$ : Entre $(A(1;0))$ et $(E(-1;0))$.
     $$AE^{2} = (-1-1)^{2} + (0-0)^{2} = 4 + 0 = 4$$

## Réponse à la Question 2-a) (Nombre Rationnel pour $(AB)$)

$(AB^{2} = 1)$ donc $(AB = \\sqrt{1} = 1)$.

1 est un nombre rationnel (car $(1 = \\frac{1}{1})$).

**Conclusion** : Oui, $(AB)$ peut s'exprimer par un nombre rationnel $((AB = 1))$.

## Formule de Distance entre Deux Points

La distance entre deux points $(A(x_A, y_A))$ et $(B(x_B, y_B))$ est donnée par :

$$AB = \\sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}}$$

Cette formule utilise le théorème de Pythagore dans un repère orthonormé.

## Résumé Clé

| Concept | Formule/Propriété |
|---------|-------------------|
| Théorème de Pythagore | $(\\text{Hypoténuse}^{2} = \\text{Côté}_1^{2} + \\text{Côté}_2^{2})$ |
| Distance entre 2 points | $(AB = \\sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}})$ |
| Réciproque | Si $(c^{2} = a^{2} + b^{2})$, alors le triangle est rectangle. |

**Astuce** : Pour retenir Pythagore, pensez au "3-4-5" ou au "5-12-13" (autres triplets pythagoriciens).
