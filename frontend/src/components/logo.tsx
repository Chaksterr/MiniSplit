interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { container: 'w-7 h-7', text: 'text-lg', fontSize: '16' },
    md: { container: 'w-9 h-9', text: 'text-2xl', fontSize: '20' },
    lg: { container: 'w-12 h-12', text: 'text-3xl', fontSize: '24' }
  }

  const { container, text, fontSize } = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo Icon - Inspired by Spliit's clean geometric style */}
      <div className={`${container} relative flex items-center justify-center`}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          
          {/* Main circle background */}
          <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
          
          {/* Split symbol - Two halves with a dividing line */}
          <g transform="translate(50, 50)">
            {/* Left half - coin/money symbol */}
            <circle cx="-15" cy="0" r="16" fill="white" fillOpacity="0.95" />
            <text 
              x="-15" 
              y="7" 
              fontSize="14" 
              fontWeight="700" 
              fill="#10b981" 
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              D
            </text>
            
            {/* Right half - coin/money symbol */}
            <circle cx="15" cy="0" r="16" fill="white" fillOpacity="0.95" />
            <text 
              x="15" 
              y="7" 
              fontSize="14" 
              fontWeight="700" 
              fill="#10b981" 
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              T
            </text>
            
            {/* Dividing line in the middle */}
            <line 
              x1="0" 
              y1="-20" 
              x2="0" 
              y2="20" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      
      {showText && (
        <span 
          className={`${text} font-bold text-gray-900 tracking-tight`}
          style={{ fontFamily: "'Cal Sans', 'Inter', system-ui, sans-serif" }}
        >
          MiniSplit
        </span>
      )}
    </div>
  )
}
