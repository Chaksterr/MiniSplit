// Tunisian expense categories
export const TUNISIAN_CATEGORIES = {
  FOOD: 'food',
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  GROCERIES: 'groceries',
  TRANSPORT: 'transport',
  ENTERTAINMENT: 'entertainment',
  SHOPPING: 'shopping',
  BILLS: 'bills',
  HEALTH: 'health',
  OTHER: 'other',
} as const;

export type TunisianCategory = typeof TUNISIAN_CATEGORIES[keyof typeof TUNISIAN_CATEGORIES];

// Currency configuration
export const CURRENCY = {
  CODE: 'TND',
  SYMBOL: 'د.ت',
  NAME: 'Tunisian Dinar',
  MILLIMES: 1000, // 1 TND = 1000 millimes
} as const;

// Format amount in TND
export function formatTND(amount: number): string {
  return `${amount.toFixed(3)} ${CURRENCY.SYMBOL}`;
}

// Common Tunisian expense examples
export const TUNISIAN_EXPENSE_EXAMPLES = {
  cafe: ['Café', 'Cappuccino', 'Thé', 'Jus'],
  restaurant: ['Restaurant', 'Couscous', 'Brik', 'Lablabi'],
  groceries: ['Monoprix', 'Carrefour', 'Magasin', 'Marché'],
  transport: ['Taxi', 'Louage', 'Bus', 'Essence'],
  entertainment: ['Cinema', 'Sortie', 'Concert'],
} as const;
