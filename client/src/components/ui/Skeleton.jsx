// Usage:
//   <Skeleton type="card" count={6} />
//   <Skeleton type="list" count={5} />
//   <Skeleton type="detail" />
//   <Skeleton type="text" lines={3} />

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200"/>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"/>
        <div className="h-4 bg-gray-200 rounded w-full"/>
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="flex justify-between items-center mt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"/>
          <div className="w-8 h-8 bg-gray-200 rounded-full"/>
        </div>
      </div>
    </div>
  )
}

export function SkeletonList() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0"/>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="h-3 bg-gray-200 rounded w-1/2"/>
        <div className="h-3 bg-gray-200 rounded w-1/4"/>
      </div>
      <div className="h-6 bg-gray-200 rounded w-16 shrink-0"/>
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-2xl"/>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"/>
        <div className="h-8 bg-gray-200 rounded w-3/4"/>
        <div className="h-6 bg-gray-200 rounded w-1/4"/>
        <div className="h-20 bg-gray-200 rounded"/>
        <div className="h-12 bg-gray-200 rounded-xl"/>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}/>
      ))}
    </div>
  )
}

export default function Skeleton({ type = 'card', count = 1, lines }) {
  if (type === 'detail') return <SkeletonDetail/>
  if (type === 'text')   return <SkeletonText lines={lines}/>

  return (
    <>
      {[...Array(count)].map((_, i) =>
        type === 'list' ? <SkeletonList key={i}/> : <SkeletonCard key={i}/>
      )}
    </>
  )
}
