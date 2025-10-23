import express from 'express';
import { requireChef } from '../middleware/auth.js';

const router = express.Router();

// 🍰 Gâteaux en mémoire (on simulera la base SQLite plus tard)
let cakes = [
  {
    id: 1,
    name: 'Gâteau basque',
    price: 24,
    imageUrl: '/uploads/gateau-basque.jpg',
    active: true
  },
  {
    id: 2,
    name: 'Clafoutis aux poires',
    price: 19,
    imageUrl: '/uploads/clafoutis-poires.jpg',
    active: true
  }
];

// 🔹 GET — liste tous les gâteaux
router.get('/', (req, res) => {
  res.json(cakes.filter(c => c.active));
});

// 🔹 GET — un gâteau spécifique
router.get('/:id', (req, res) => {
  const cake = cakes.find(c => c.id === parseInt(req.params.id));
  if (!cake) return res.status(404).json({ message: 'Gâteau introuvable' });
  res.json(cake);
});

// 🔹 POST — ajouter un gâteau (réservé au chef)
router.post('/', requireChef, (req, res) => {
  const { name, price, imageUrl } = req.body;
  if (!name || !price || !imageUrl)
    return res.status(400).json({ message: 'Champs manquants' });

  const newCake = {
    id: cakes.length + 1,
    name,
    price: parseFloat(price),
    imageUrl,
    active: true
  };
  cakes.push(newCake);
  res.status(201).json({ message: 'Gâteau ajouté', cake: newCake });
});

// 🔹 PUT — modifier un gâteau (réservé au chef)
router.put('/:id', requireChef, (req, res) => {
  const cake = cakes.find(c => c.id === parseInt(req.params.id));
  if (!cake) return res.status(404).json({ message: 'Gâteau introuvable' });

  const { name, price, imageUrl, active } = req.body;
  if (name) cake.name = name;
  if (price) cake.price = parseFloat(price);
  if (imageUrl) cake.imageUrl = imageUrl;
  if (active !== undefined) cake.active = active;

  res.json({ message: 'Gâteau mis à jour', cake });
});

// 🔹 DELETE — supprimer un gâteau (réservé au chef)
router.delete('/:id', requireChef, (req, res) => {
  const index = cakes.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Gâteau introuvable' });

  cakes.splice(index, 1);
  res.json({ message: 'Gâteau supprimé' });
});

export default router;
