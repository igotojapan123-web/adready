interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color?: string
  sub?: string
}

export default function StatCard({ label, value, icon, color = 'gray', sub }: StatCardProps) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-50 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${colorMap[color] ?? colorMap.gray}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
