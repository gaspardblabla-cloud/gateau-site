import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Commandes en mémoire
let orders = [];
let availabilities = {}; // { "cakeId_date": true/false }

function key(cakeId, date) {
  return `${cakeId}_${date}`;
}

// 🔹 Créer une commande
router.post("/", requireAuth, (req, res) => {
  const { cakeId, date } = req.body;
  if (!cakeId || !date)
    return res.status(400).json({ message: "Gâteau ou date manquant." });

  const k = key(cakeId, date);
  if (availabilities[k] === false)
    return res
      .status(400)
      .json({ message: "Cette date n’est plus disponible pour ce gâteau." });

  const newOrder = {
    id: orders.length + 1,
    userId: req.user.id,
    cakeId,
    date,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json({ message: "Commande créée", order: newOrder });
});

// 🔹 Le chef voit toutes les commandes
router.get("/", (req, res) => {
  res.json(orders);
});

// 🔹 L’utilisateur voit ses commandes
router.get("/mine", requireAuth, (req, res) => {
  const mine = orders.filter((o) => o.userId === req.user.id);
  res.json(mine);
});

// 🔹 Le chef accepte une commande
router.put("/:id/accept", (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: "Commande introuvable" });

  order.status = "accepted";
  const k = key(order.cakeId, order.date);
  availabilities[k] = false; // bloque cette date pour ce gâteau

  res.json({ message: "Commande acceptée", order });
});

// 🔹 Le chef refuse une commande
router.put("/:id/reject", (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: "Commande introuvable" });

  order.status = "rejected";
  res.json({ message: "Commande refusée", order });
});

export default router;
