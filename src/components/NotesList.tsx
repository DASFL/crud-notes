import { Component } from 'react'
import NoteCard from './NoteCard'
import type { Note } from './NoteCard'

interface NotesListProps {
  notes: Note[]
  onDelete: (id: number) => void
  disabled: boolean
}

class NotesList extends Component<NotesListProps> {
  render() {
    const { notes, onDelete, disabled } = this.props

    return (
      <div className="notes-list">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={onDelete} disabled={disabled} />
        ))}
      </div>
    )
  }
}

export default NotesList
