// client/src/components/ai/AIChatbot.jsx  ← NEW FILE
import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend, FiMinimize2 } from 'react-icons/fi'
import { BsRobot } from 'react-icons/bs'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const QUICK_PROMPTS = [
  'What are your best deals?',
  'Help me find electronics',
  'How do I track my order?',
  'What is your return policy?',
]

export default function AIChatbot() {
  const { isUser } = useAuth()
  const [open,    setOpen]    = useState(false)
  const [messages, setMsgs]  = useState([
    { role: 'assistant', content: '👋 Hi! I\'m ShopBot. How can I help you today?' }
  ])
  const [input,   setInput]  = useState('')
  const [loading, setLoading]= useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg   = { role: 'user', content: msg }
    const newMsgs   = [...messages, userMsg]
    setMsgs(newMsgs)
    setLoading(true)

    try {
      const history = newMsgs.slice(-8)  // send last 8 messages as context
      const { data } = await api.post('/ai/chat', { message: msg, history })
      setMsgs(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  // Don't show chatbot if not logged in
  if (!isUser) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Chat Window */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BsRobot className="text-white text-xl" />
              <div>
                <p className="text-white font-semibold text-sm">ShopBot AI</p>
                <p className="text-orange-100 text-xs">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-orange-200">
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 flex flex-wrap gap-1 bg-white border-t border-gray-100">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-xs px-2 py-1 rounded-full border border-orange-200 text-orange-600 hover:bg-orange-50 transition">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything..."
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-orange-400"
              disabled={loading}
            />
            <button onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {open ? <FiX size={22} /> : <FiMessageSquare size={22} />}
      </button>
    </div>
  )
}
