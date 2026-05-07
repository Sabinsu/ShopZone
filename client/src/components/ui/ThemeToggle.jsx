// client/src/components/ui/ThemeToggle.jsx
import { useTheme } from '../../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme, isDark } = useTheme()

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{
          width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
          background: 'var(--dark-4)', border: '1px solid var(--dark-5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isDark ? 'var(--gold)' : 'var(--text-2)',
          transition: 'all 0.2s',
        }}
      >
        {isDark ? <FiSun size={16}/> : <FiMoon size={16}/>}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        background: 'none', border: 'none', padding: '6px 10px', borderRadius: 10,
        color: 'var(--text-2)', transition: 'all 0.2s',
      }}
    >
      <div className={`theme-toggle${isDark ? '' : ' light'}`}>
        <div className="theme-toggle-knob"/>
      </div>
      {isDark ? <FiMoon size={14}/> : <FiSun size={14}/>}
      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
