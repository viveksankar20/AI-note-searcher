import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api'
import NoteCard from '../components/NoteCard.jsx'

export default function Dashboard() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('keyword')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadNotes() {
    try {
      const data = await apiGet('/notes')
      setNotes(data)
    } catch {
      // ignore
    }
  }

  useEffect(() => { loadNotes() }, [])

  async function saveNote(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        const updated = await apiPut(`/notes/${editing._id}`, {
          title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        })
        setNotes(n => n.map(x => x._id === updated._id ? updated : x))
        setEditing(null)
      } else {
        const created = await apiPost('/notes', { title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
        setNotes(n => [created, ...n])
      }
      setTitle(''); setContent(''); setTags('')
    } catch (err) {
      setError('Could not save note')
    }
  }

  async function onDelete(note) {
    if (!confirm('Delete this note?')) return
    await apiDelete(`/notes/${note._id}`)
    setNotes(n => n.filter(x => x._id !== note._id))
  }

  function onEdit(note) {
    setEditing(note)
    setTitle(note.title)
    setContent(note.content)
    setTags((note.tags || []).join(', '))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function runSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError('')
    try {
      const data = await apiGet(`/search?query=${encodeURIComponent(query)}&mode=${mode}`)
      setResults(data.results || [])
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl p-4 shadow border">
        <h2 className="text-xl font-semibold mb-3">{editing ? 'Edit note' : 'New note'}</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={saveNote} className="grid gap-3">
          <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea className="border rounded px-3 py-2 min-h-[120px]" placeholder="Content" value={content} onChange={e => setContent(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded bg-gray-900 text-white">{editing ? 'Update' : 'Create'}</button>
            {editing && <button type="button" className="px-4 py-2 rounded bg-gray-100" onClick={() => { setEditing(null); setTitle(''); setContent(''); setTags('') }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-2xl p-4 shadow border">
        <h2 className="text-xl font-semibold mb-3">Search notes</h2>
        <form onSubmit={runSearch} className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" placeholder="Type your query..." value={query} onChange={e => setQuery(e.target.value)} />
          <select value={mode} onChange={e => setMode(e.target.value)} className="border rounded px-2 py-2">
            <option value="keyword">Keyword</option>
            <option value="semantic">AI (Semantic)</option>
          </select>
          <button className="px-4 py-2 rounded bg-gray-900 text-white">Search</button>
        </form>
        {loading && <div className="mt-3 text-sm text-gray-600">Searching...</div>}
        {results.length > 0 && (
          <div className="mt-4 grid gap-3">
            {results.map(r => <NoteCard key={r._id} note={r} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">All notes</h2>
        <div className="grid gap-3">
          {notes.map(n => <NoteCard key={n._id} note={n} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </section>
    </div>
  )
}
