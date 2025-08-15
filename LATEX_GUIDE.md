# Guide d'Utilisation des Formules LaTeX

## Vue d'ensemble

L'application supporte maintenant le rendu des formules mathématiques LaTeX en plus du Markdown. Les formules sont rendues avec KaTeX pour un affichage de haute qualité.

## Types de Formules Supportées

### 1. Formules en Ligne (Inline)

Utilisez des dollars simples `$...$` pour les formules en ligne :

```markdown
La formule $x^2 + y^2 = z^2$ est le théorème de Pythagore.
```

### 2. Formules en Bloc (Display)

Utilisez des dollars doubles `$$...$$` pour les formules en bloc :

```markdown
$$AB^{2} = AC^{2} + BC^{2}$$
```

### 3. Formules avec Crochets

Les formules entre crochets `[...]` sont automatiquement converties en blocs :

```markdown
[ \boxed{AB^{2} = AC^{2} + BC^{2}} ]
```

## Formules LaTeX Courantes

### Racines Carrées

```markdown
$\\sqrt{x}$
$\\sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}}$
```

### Fractions

```markdown
$\\frac{a}{b}$
$\\frac{x_B - x_A}{y_B - y_A}$
```

### Exposants et Indices

```markdown
$x^2$ (exposant)
$x_2$ (indice)
$x^{2n}$ (exposant complexe)
$x_{i,j}$ (indice complexe)
```

### Vecteurs

```markdown
$\\overrightarrow{AB}$
$\\vec{v}$
```

### Symboles Mathématiques

```markdown
$\\alpha, \\beta, \\gamma, \\delta$
$\\pi, \\sigma, \\lambda, \\theta$
$\\pm, \\infty$
```

### Fonctions

```markdown
$\\sin(x), \\cos(x), \\tan(x)$
$\\log(x), \\ln(x)$
```

## Exemples Complets

### Théorème de Pythagore

```markdown
# Théorème de Pythagore

Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés :

$$AB^{2} = AC^{2} + BC^{2}$$

Où :
- $AB$ est l'hypoténuse
- $AC$ et $BC$ sont les côtés de l'angle droit
```

### Distance entre Deux Points

```markdown
## Distance entre Deux Points

La distance entre deux points $A(x_A, y_A)$ et $B(x_B, y_B)$ est donnée par :

$$AB = \\sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}}$$

Cette formule utilise le théorème de Pythagore.
```

### Formules Complexes

```markdown
## Formules Complexes

### Racine avec Fractions
$$\\sqrt{\\frac{a^2 + b^2}{c^2}}$$

### Vecteur avec Coordonnées
$$\\overrightarrow{AB} = \\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$$

### Équation avec Boxed
[ \\boxed{AB^{2} = AC^{2} + BC^{2}} ]
```

## Bonnes Pratiques

### 1. Échappement des Caractères

Dans le texte Markdown, échappez les backslashes LaTeX :

```markdown
$\\sqrt{x}$  ✅ Correct
$\sqrt{x}$   ❌ Incorrect
```

### 2. Espacement

Laissez des espaces autour des formules en ligne :

```markdown
La formule $x^2$ est correcte.  ✅
La formule$x^2$est incorrecte.  ❌
```

### 3. Formules Complexes

Pour les formules complexes, utilisez des blocs :

```markdown
$$\\sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}}$$  ✅
$\\sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}}$    ❌ (peut causer des problèmes d'affichage)
```

## Test de Rendu

Pour tester le rendu des formules, visitez `/test` dans votre application. Cette page contient des exemples de toutes les formules supportées.

## Dépannage

### Formule non rendue

1. Vérifiez l'échappement des backslashes
2. Assurez-vous que les accolades sont bien fermées
3. Utilisez des blocs pour les formules complexes

### Erreur de syntaxe

1. Vérifiez la syntaxe LaTeX
2. Assurez-vous que tous les symboles sont supportés par KaTeX
3. Testez avec des formules plus simples

## Support des Symboles

L'application utilise KaTeX qui supporte la plupart des symboles mathématiques LaTeX. Consultez la [documentation KaTeX](https://katex.org/docs/supported.html) pour la liste complète des symboles supportés.
