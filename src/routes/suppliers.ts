import { Router } from 'express';
import { prisma } from '../prisma';
import { isValidCNPJ, isEmail, isPhoneBR } from '../validators';

const r = Router();


r.get('/', async (_req, res) => {
const list = await prisma.supplier.findMany({ orderBy: { id: 'desc' } });
res.json(list);
});

r.post('/', async (req, res) => {
try {
const { name, cnpj, address, phone, email, mainContact } = req.body || {};


const errors: Record<string,string> = {};
if (!name?.trim()) errors.name = 'Nome da empresa é obrigatório';
if (!cnpj?.trim() || !isValidCNPJ(cnpj)) errors.cnpj = 'CNPJ inválido';
if (!address?.trim()) errors.address = 'Endereço é obrigatório';
if (!phone?.trim() || !isPhoneBR(phone)) errors.phone = 'Telefone inválido';
if (!email?.trim() || !isEmail(email)) errors.email = 'E-mail inválido';
if (!mainContact?.trim()) errors.mainContact = 'Contato principal é obrigatório';


if (Object.keys(errors).length) {
return res.status(400).json({ error: 'Dados inválidos', fieldErrors: errors });
}


const created = await prisma.supplier.create({
data: { name: name.trim(), cnpj: cnpj.trim(), address: address.trim(), phone: phone.trim(), email: email.trim(), mainContact: mainContact.trim() },
});
return res.status(201).json({ message: 'Fornecedor cadastrado com sucesso!', supplier: created });
} catch (e: any) {
if (e?.code === 'P2002' && e?.meta?.target?.includes('cnpj')) {
return res.status(409).json({ error: 'Fornecedor com esse CNPJ já está cadastrado!' });
}
return res.status(400).json({ error: e?.message ?? 'Erro ao cadastrar fornecedor' });
}
});

r.post('/:supplierId/products/:productId', async (req, res) => {
try {
const supplierId = Number(req.params.supplierId);
const productId = Number(req.params.productId);
const { price, leadTimeDays } = req.body || {};


if (Number.isNaN(supplierId) || Number.isNaN(productId)) {
return res.status(400).json({ error: 'IDs inválidos' });
}


const link = await prisma.supplierProduct.create({
data: {
supplierId,
productId,
price: price != null ? price.toString() : undefined,
leadTimeDays: leadTimeDays ?? undefined,
},
});
return res.status(201).json({ message: 'Fornecedor associado com sucesso ao produto!', link });
} catch (e: any) {
if (e?.code === 'P2002') {
return res.status(409).json({ error: 'Fornecedor já está associado a este produto!' });
}
return res.status(400).json({ error: e?.message ?? 'Erro ao associar fornecedor' });
}
});

// DELETE /suppliers/:supplierId/products/:productId (desassociar)
r.delete('/:supplierId/products/:productId', async (req, res) => {
try {
const supplierId = Number(req.params.supplierId);
const productId = Number(req.params.productId);
await prisma.supplierProduct.delete({ where: { supplierId_productId: { supplierId, productId } } });
return res.json({ message: 'Fornecedor desassociado com sucesso!' });
} catch (e: any) {
return res.status(400).json({ error: e?.message ?? 'Erro ao desassociar fornecedor' });
}
});


r.get('/:supplierId/products', async (req, res) => {
const supplierId = Number(req.params.supplierId);
if (Number.isNaN(supplierId)) return res.status(400).json({ error: 'ID inválido' });


const supplier = await prisma.supplier.findUnique({
where: { id: supplierId },
include: { products: { include: { product: true }, orderBy: { createdAt: 'desc' } } },
});
if (!supplier) return res.status(404).json({ error: 'Fornecedor não encontrado' });


const products = supplier.products.map(sp => ({
...sp.product,
negotiatedPrice: sp.price,
leadTimeDays: sp.leadTimeDays,
linkCreatedAt: sp.createdAt,
}));


res.json({ supplier: { id: supplier.id, name: supplier.name }, products });
});


export default r;