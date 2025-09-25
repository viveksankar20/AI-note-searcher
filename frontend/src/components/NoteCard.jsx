export default function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow border">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{note.title}</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1 line-clamp-3">{note.content}</p>
          {note.score !== undefined && <div className="text-xs text-gray-500 mt-2">Score: {note.score.toFixed(3)}</div>}
        </div>
        <div className="space-x-2">
          <button onClick={() => onEdit(note)} className="px-2 py-1 text-sm rounded bg-gray-100">Edit</button>
          <button onClick={() => onDelete(note)} className="px-2 py-1 text-sm rounded bg-red-50 text-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}
