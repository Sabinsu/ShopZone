// client/src/components/ai/AIChatbot.jsx
import { useState, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend, FiMinus } from 'react-icons/fi'
import api from '../../api/axios'

const SUGGESTED = [
  'Show me trending products',
  'How do I track my order?',
  'What is your return policy?',
  'Best deals today?',
]

export default function AIChatbot() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! 👋 I\'m ShopZone AI. Ask me about products, orders, or anything else!' }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [minimized, setMinimized] = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, open, minimized])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const { data } = await api.post('/ai/chat', { message: msg })
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I\'m having trouble connecting. Please try again!' }])
    } finally { setLoading(false) }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600
                     text-white rounded-full shadow-lg flex items-center justify-center
                     z-50 transition-all hover:scale-110 active:scale-95"
        >
          <FiMessageCircle size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-2xl shadow-2xl
                         flex flex-col border border-gray-100 animate-slide-up overflow-hidden
                         transition-all duration-300 ${minimized ? 'h-14' : 'h-[480px]'}`}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-white flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-none">ShopZone AI</p>
              <p className="text-xs text-orange-100 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-green-300 rounded-full mr-1" />Online
              </p>
            </div>
            <button onClick={() => setMinimized(!minimized)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <FiMinus size={16} />
            </button>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <FiX size={16} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions (shown only on first message) */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTED.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-xs bg-orange-50 text-orange-600 border border-orange-200
                                 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2 p-3 border-t border-gray-100">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:opacity-40
                             text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                >
                  <FiSend size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
