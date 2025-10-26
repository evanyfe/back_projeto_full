import { Router } from "express";
import { prisma } from "../prisma";


const r = Router();

r.get("/", async (_req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

r.post('/', async (req, res) => {
try {
const { name, price, barcode, description, quantity, category, expiry, imageUrl } = req.body || {};


const errors: Record<string,string> = {};
if (!name?.trim()) errors.name = 'Nome do produto é obrigatório';
if (price == null || String(price).trim() === '' || isNaN(Number(String(price).replace(',', '.')))) errors.price = 'Preço inválido';
if (!barcode?.trim()) errors.barcode = 'Código de barras é obrigatório';
if (!description?.trim()) errors.description = 'Descrição é obrigatória';
if (quantity == null || isNaN(Number(quantity))) errors.quantity = 'Quantidade inválida';
if (!category?.trim()) errors.category = 'Categoria é obrigatória';
// expiry e imageUrl são opcionais


if (Object.keys(errors).length) {
return res.status(400).json({ error: 'Dados inválidos', fieldErrors: errors });
}


const created = await prisma.product.create({
data: {
name: name.trim(),
price: String(price).trim(),
barcode: barcode.trim(),
description: description.trim(),
quantity: Number(quantity),
category: category.trim(),
expiry: expiry ? new Date(expiry) : undefined,
imageUrl: imageUrl?.trim() || undefined,
},
});
return res.status(201).json({ message: 'Produto cadastrado com sucesso!', product: created });
} catch (e: any) {
if (e?.code === 'P2002' && e?.meta?.target?.includes('barcode')) {
return res.status(409).json({ error: 'Produto com este código de barras já está cadastrado!' });
}
return res.status(400).json({ error: e?.message ?? 'Erro ao cadastrar produto' });
}
});

r.get('/:productId/suppliers', async (req, res) => {
  const productId = Number(req.params.productId);
  if (Number.isNaN(productId)) return res.status(400).json({ error: 'ID inválido' });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      suppliers: {             // join table
        include: { supplier: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

  const suppliers = product.suppliers.map(sp => ({
    ...sp.supplier,
    negotiatedPrice: sp.price,
    leadTimeDays: sp.leadTimeDays,
    linkCreatedAt: sp.createdAt,
  }));

  res.json({ product: { id: product.id, name: product.name }, suppliers });
});

export default r;
