import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// En mémoire (tu peux remplacer plus tard par SQLite)
let users = [
  {
    id: 1,
    username: 'jochef28',
    email: 'chef@example.com',
    passwordHash: bcrypt.hashSync('Chef!234', 10),
    role: 'chef'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware pour vérifier le token
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
}

// 🔹 Route d’inscription
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'Champs manquants' });

  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ message: 'Email déjà utilisé' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, email, passwordHash, role: 'user' };
  users.push(user);

  res.status(201).json({ message: 'Utilisateur créé', user: { id: user.id, username, email } });
});

// 🔹 Route de connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// 🔹 Route pour récupérer le profil
router.get('/me', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

export default router;
