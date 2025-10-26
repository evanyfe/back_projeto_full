import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import users from "./routes/users";
import products from "./routes/products";
import suppliers from "./routes/suppliers";

import { prisma } from "./prisma";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/users", users);
app.use("/products", products);
app.use('/suppliers', suppliers);

app.post("/users/:userId/products/:productId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);

    await prisma.userProduct.create({ data: { userId, productId } });
    res.status(201).json({ message: "Produto vinculado ao usuário" });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Erro ao vincular" });
  }
});

app.get("/users/:id/full", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { products: { include: { product: true } } },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const products = user.products.map((up: any) => up.product);
    res.json({ ...user, products });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Erro ao buscar" });
  }
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
