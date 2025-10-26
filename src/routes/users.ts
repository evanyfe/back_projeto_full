import { Router } from "express";
import { prisma } from "../prisma";


const r = Router();

r.get("/", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

r.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Erro ao criar usuário" });
  }
});

export default r;
