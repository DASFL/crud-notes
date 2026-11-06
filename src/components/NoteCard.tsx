import { Component } from 'react'

export interface Note {
  id: number
  content: string
}

interface NoteCardProps {
  note: Note
  onDelete: (id: number) => void
  disabled: boolean
}

class NoteCard extends Component<NoteCardProps> {
  render() {
    const { note, onDelete, disabled } = this.props

    return (
      <article className="note-card" aria-label={`Заметка ${note.id}`}>
        <button
          className="delete-button"
          type="button"
          aria-label={`Удалить заметку ${note.id}`}
          onClick={() => onDelete(note.id)}
          disabled={disabled}
        >×</button>
        <p>{note.content}</p>
      </article>
    )
  }
}

export default NoteCard
