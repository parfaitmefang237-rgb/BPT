# Bibliotheque Professionnelle Transfrontaliere

Application web full-stack pour centraliser des PDF, videos, logiciels, liens utiles et documents personnels avec acces par groupes.

## Lancer le projet

```bash
cd mon-projet-bpt
npm run install:backend
npm run dev
```

Puis ouvrir:

```text
http://localhost:3000
```

Compte admin initial:

```text
Email: admin@bpt.local
Mot de passe: AdminBPT2026!
```

## Notes techniques

- Backend: Node.js, Express, SQLite, Multer, JWT, bcrypt.
- Frontend: HTML5, CSS3, JavaScript vanilla.
- Fichiers uploades: `backend/protected_uploads`.
- Fichiers autorises: PDF, DOCX, MP4, ZIP.
- Taille maximale: 20 Mo.
- La base `backend/bpt.sqlite` est creee automatiquement au premier demarrage.
