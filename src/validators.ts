export function onlyDigits(s: string) { return (s || '').replace(/\D+/g, ''); }

export function isValidCNPJ(cnpj: string): boolean {
const s = onlyDigits(cnpj);
if (s.length !== 14 || /^([0-9])\1+$/.test(s)) return false;
const calc = (base: string, factors: number[]) => (
factors.reduce((sum, f, i) => sum + Number(base[i]) * f, 0) % 11
);
const d1 = 11 - calc(s.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
const v1 = d1 > 9 ? 0 : d1;
const d2 = 11 - calc(s.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
const v2 = d2 > 9 ? 0 : d2;
return v1 === Number(s[12]) && v2 === Number(s[13]);
}


export function isEmail(s: string) {
return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');
}


export function isPhoneBR(s: string) {
return onlyDigits(s).length >= 10;
}