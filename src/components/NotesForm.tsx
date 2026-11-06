import { Component } from 'react'
import type { FormEvent } from 'react'

interface NotesFormProps {
  content: string
  onChange: (content: string) => void
  onAdd: () => void
  disabled: boolean
}

class NotesForm extends Component<NotesFormProps> {
  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    this.props.onAdd()
  }

  render() {
    const { content, onChange, disabled } = this.props

    return (
      <form className="notes-form" onSubmit={this.handleSubmit}>
        <label htmlFor="note-content">Новая заметка</label>
        <textarea
          id="note-content"
          value={content}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Что хотите записать?"
          rows={4}
          disabled={disabled}
        />
        <button className="add-button" type="submit" disabled={disabled}>Добавить</button>
      </form>
    )
  }
}

export default NotesForm
