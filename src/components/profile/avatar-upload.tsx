'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Link2, Check, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentUrl: string | null
  initials: string
  userId: string
  onUpdate: (url: string) => void
}

export function AvatarUpload({ currentUrl, initials, userId, onUpdate }: AvatarUploadProps) {
  const [mode, setMode] = useState<'view' | 'url'>('view')
  const [urlInput, setUrlInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  // Save URL
  const handleSaveUrl = async () => {
    if (!urlInput.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: urlInput.trim() })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to save avatar URL')
    } else {
      onUpdate(urlInput.trim())
      toast.success('Avatar updated! ✅')
      setMode('view')
      setUrlInput('')
    }
    setSaving(false)
  }

  // Upload file to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.')
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('Upload failed. Try URL instead.')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = data.publicUrl

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
    onUpdate(publicUrl)
    toast.success('Photo uploaded! 📸')
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-primary/30">
          <AvatarImage src={currentUrl ?? ''} />
          <AvatarFallback className="bg-primary/10 text-primary font-black text-3xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          {uploading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <Camera className="w-6 h-6 text-white" />
          }
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        Hover to upload · or paste URL below
      </p>

      {mode === 'view' ? (
        <button
          onClick={() => setMode('url')}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Link2 className="w-3.5 h-3.5" />
          Use image URL
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full space-y-2"
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-3 py-2 rounded-xl bg-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => setMode('view')}
              className="flex-1 py-2 rounded-xl glass text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveUrl}
              disabled={saving || !urlInput.trim()}
              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}