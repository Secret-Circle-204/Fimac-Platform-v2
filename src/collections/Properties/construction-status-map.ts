export const constructionStatusMap = {
  ready: {
    label: 'Ready to Move In',
    labelAr: 'جاهز للسكن',
    color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    icon: '🔑',
  },
  under_construction: {
    label: 'Under Construction',
    labelAr: 'تحت الإنشاء',
    color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    icon: '🏗️',
  },
  brand_new: {
    label: 'Brand New (First Occupancy)',
    labelAr: 'أول سكن / أول مفتاح',
    color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    icon: '✨',
  },
  off_plan: {
    label: 'Off-Plan',
    labelAr: 'على الخارطة',
    color: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400',
    icon: '📋',
  },
  renovated: {
    label: 'Fully Renovated',
    labelAr: 'مجدد بالكامل',
    color: 'bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
    icon: '🛠️',
  },
} as const

export type ConstructionStatusType = keyof typeof constructionStatusMap
