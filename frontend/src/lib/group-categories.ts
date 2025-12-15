export const GROUP_CATEGORIES = [
  {
    value: 'travel',
    label: 'Voyage',
    icon: '✈️',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    value: 'sport',
    label: 'Sport',
    icon: '⚽',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    value: 'food',
    label: 'Nourriture',
    icon: '🍔',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    value: 'entertainment',
    label: 'Divertissement',
    icon: '🎬',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    value: 'work',
    label: 'Travail',
    icon: '💼',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  {
    value: 'family',
    label: 'Famille',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    value: 'friends',
    label: 'Amis',
    icon: '👥',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  {
    value: 'other',
    label: 'Autre',
    icon: '📌',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
] as const

export type GroupCategory = typeof GROUP_CATEGORIES[number]['value']

export function getCategoryInfo(category?: string) {
  return GROUP_CATEGORIES.find(c => c.value === category) || GROUP_CATEGORIES[GROUP_CATEGORIES.length - 1]
}
