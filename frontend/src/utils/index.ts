// TODO: remember to solve this ts problem and remove ignore flag
//@ts-ignore
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export function cleanPrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;

  const cleaned = String(priceStr)
    .replace(/[^\d.,]/g, "")
    .replace(",", ".");

  const value = parseFloat(cleaned);

  return Math.floor(isNaN(value) ? 0 : value);
}

type TTRANSLATE_WORDS = {
  [key: string]: string;
};

// export const TRANSLATE_WORDS: TTRANSLATE_WORDS = {
//   approved: "Oдобрено",
//   rejected: "Отклонено",
//   replaceOil: "Замена масла",
//   pickup: "Самовывоз",
// };


export const TRANSLATE_WORDS:TTRANSLATE_WORDS = {
  replaceOil: 'Замена масла',
  pickup: 'Самовывоз',
  approved: 'Одобрен',
  pending: 'Ожидает оплаты',
  rejected: 'Отклонён',
};