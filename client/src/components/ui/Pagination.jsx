// client/src/components/ui/Pagination.jsx
/**
 * Reusable Pagination component
 * Props: page, totalPages, onPageChange, loading?
 */
export default function Pagination({ page, totalPages, onPageChange, loading = false }) {
  if (totalPages <= 1) return null

  // Build page numbers with ellipsis
  const getPages = () => {
    const delta = 2
    const pages = []
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i)
    }
    if (pages[0] > 1) {
      if (pages[0] > 2) pages.unshift('...')
      pages.unshift(1)
    }
    if (pages[pages.length - 1] < totalPages) {
      if (pages[pages.length - 1] < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: '2.5rem', flexWrap: 'wrap' }}>
      {/* Prev */}
      <button
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
        style={{
          padding: '8px 18px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
          background: 'var(--dark-4)', color: page <= 1 ? 'var(--text-3)' : 'var(--text-1)',
          border: '1px solid var(--dark-5)', cursor: page <= 1 ? 'not-allowed' : 'pointer',
          opacity: page <= 1 ? 0.45 : 1, transition: 'all 0.2s',
        }}
      >← Prev</button>

      {/* Pages */}
      {getPages().map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ color: 'var(--text-3)', padding: '0 4px', fontSize: '0.85rem' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading}
            style={{
              width: 38, height: 38, borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
              background: p === page ? 'linear-gradient(135deg, var(--gold-light), var(--gold))' : 'var(--dark-4)',
              color: p === page ? '#0A0A0F' : 'var(--text-2)',
              border: `1px solid ${p === page ? 'var(--gold)' : 'var(--dark-5)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: p === page ? '0 4px 12px rgba(212,175,55,0.35)' : 'none',
              transform: p === page ? 'scale(1.05)' : 'scale(1)',
            }}
          >{p}</button>
        )
      )}

      {/* Next */}
      <button
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
        style={{
          padding: '8px 18px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
          background: 'var(--dark-4)', color: page >= totalPages ? 'var(--text-3)' : 'var(--text-1)',
          border: '1px solid var(--dark-5)', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
          opacity: page >= totalPages ? 0.45 : 1, transition: 'all 0.2s',
        }}
      >Next →</button>

      {/* Info */}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: 8 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  )
}
