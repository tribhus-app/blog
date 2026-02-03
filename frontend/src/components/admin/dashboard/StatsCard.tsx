interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color?: 'primary' | 'green' | 'blue' | 'yellow' | 'purple'
  subtitle?: string
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-accent-green/10 text-accent-green',
  blue: 'bg-accent-blue/10 text-accent-blue',
  yellow: 'bg-accent-yellow/10 text-accent-yellow',
  purple: 'bg-accent-purple/10 text-accent-purple',
}

export default function StatsCard({ title, value, icon, color = 'primary', subtitle }: StatsCardProps) {
  return (
    <div className="bg-dark-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-text-muted text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
