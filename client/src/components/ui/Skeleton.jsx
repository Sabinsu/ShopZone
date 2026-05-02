// client/src/components/ui/Skeleton.jsx
export function SkeletonCard() {
  return (
    <div style={{ background:'var(--dark-3)', border:'1px solid var(--dark-5)', borderRadius:18, overflow:'hidden' }}>
      <div className="skeleton" style={{ aspectRatio:'1', borderRadius:0 }}/>
      <div style={{ padding:'12px 14px' }}>
        <div className="skeleton" style={{ height:9, width:'38%', marginBottom:8 }}/>
        <div className="skeleton" style={{ height:13, width:'88%', marginBottom:5 }}/>
        <div className="skeleton" style={{ height:13, width:'65%', marginBottom:10 }}/>
        <div className="skeleton" style={{ height:16, width:'42%' }}/>
      </div>
    </div>
  )
}

export function SkeletonLine({ width = '100%', height = 14 }) {
  return <div className="skeleton" style={{ width, height, borderRadius:6 }}/>
}

export function SkeletonProductDetail() {
  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem' }}>
        <div className="skeleton" style={{ aspectRatio:'1', borderRadius:20 }}/>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="skeleton" style={{ height:10, width:'30%' }}/>
          <div className="skeleton" style={{ height:32, width:'80%' }}/>
          <div className="skeleton" style={{ height:32, width:'60%' }}/>
          <div className="skeleton" style={{ height:14, width:'95%' }}/>
          <div className="skeleton" style={{ height:14, width:'80%' }}/>
          <div className="skeleton" style={{ height:52, width:'100%', marginTop:16 }}/>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height:52, borderRadius:10 }}/>
      ))}
    </div>
  )
}
