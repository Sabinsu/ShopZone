// client/src/components/ui/ImageUpload.jsx
import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import api from '../../api/axios'
import toast from 'react-hot-toast'

/**
 * ImageUpload — supports both file upload and URL fallback
 * Props:
 *   images: string[]        — current image URLs
 *   onChange: (urls) => void
 *   maxImages?: number      — default 5
 *   uploadEndpoint?: string — default '/upload'
 */
export default function ImageUpload({ images = [], onChange, maxImages = 5, uploadEndpoint = '/upload' }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    if (!files?.length) return
    const remaining = maxImages - images.length
    if (remaining <= 0) { toast.error(`Max ${maxImages} images`); return }
    const toUpload = Array.from(files).slice(0, remaining)

    setUploading(true)
    try {
      const formData = new FormData()
      toUpload.forEach(f => formData.append('images', f))
      const { data } = await api.post(uploadEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const newUrls = data.urls || (data.url ? [data.url] : [])
      onChange([...images, ...newUrls])
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? 's' : ''} uploaded`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  const moveImage = (from, to) => {
    const arr = [...images]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    onChange(arr)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={`upload-zone${dragOver ? ' drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="spinner" style={{ width: 28, height: 28, borderTopColor: 'var(--gold)' }}/>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Uploading...</p>
            </div>
          ) : (
            <>
              <FiUpload size={28} style={{ color: 'var(--gold)', marginBottom: 8 }}/>
              <p style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: '0.875rem' }}>
                Click or drag images here
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 4 }}>
                JPG, PNG, GIF, WebP · Max 5MB each · {maxImages - images.length} slot{maxImages - images.length !== 1 ? 's' : ''} left
              </p>
            </>
          )}
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {images.map((url, idx) => (
            <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
              {idx === 0 && (
                <span style={{
                  position: 'absolute', top: 4, left: 4, zIndex: 2,
                  background: 'var(--gold)', color: '#0A0A0F',
                  fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                }}>MAIN</span>
              )}
              <img
                src={url} alt={`image-${idx}`}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10,
                  border: idx === 0 ? '2px solid var(--gold)' : '1px solid var(--dark-5)',
                  cursor: idx > 0 ? 'pointer' : 'default',
                }}
                onClick={() => idx > 0 && moveImage(idx, 0)}
                title={idx > 0 ? 'Click to set as main image' : 'Main image'}
                onError={e => { e.target.src = 'https://placehold.co/72x72/1A1A24/7A7268?text=?' }}
              />
              <button
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#ef4444', border: '2px solid var(--dark-3)',
                  color: '#fff', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', zIndex: 3,
                }}
              >
                <FiX size={10}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* URL fallback */}
      <details style={{ marginTop: 4 }}>
        <summary style={{ fontSize: '0.75rem', color: 'var(--text-3)', cursor: 'pointer' }}>
          Add image by URL instead
        </summary>
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <input
            id="url-input"
            placeholder="https://example.com/image.jpg"
            style={{
              flex: 1, padding: '7px 12px', borderRadius: 8, fontSize: '0.8rem',
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--input-text)', outline: 'none',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = e.target.value.trim()
                if (val && images.length < maxImages) { onChange([...images, val]); e.target.value = '' }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('url-input')
              const val = input?.value.trim()
              if (val && images.length < maxImages) { onChange([...images, val]); input.value = '' }
            }}
            style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--dark-4)', border: '1px solid var(--dark-5)', color: 'var(--text-1)', cursor: 'pointer', fontSize: '0.8rem' }}
          >Add</button>
        </div>
      </details>
    </div>
  )
}
