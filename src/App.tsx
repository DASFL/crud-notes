import { Component } from 'react'
import NotesForm from './components/NotesForm'
import NotesList from './components/NotesList'
import type { Note } from './components/NoteCard'
import './App.css'

const API_URL = 'http://localhost:7070/notes'

interface AppState {
  notes: Note[]
  content: string
  busy: boolean
  error: string
}

class App extends Component<object, AppState> {
  state: AppState = { notes: [], content: '', busy: false, error: '' }
  private controller: AbortController | null = null

  componentDidMount() {
    this.handleRefresh()
  }

  componentWillUnmount() {
    this.controller?.abort()
    this.controller = null
  }

  loadNotes = async (signal: AbortSignal) => {
    const response = await fetch(API_URL, { signal })
    if (!response.ok) {
      throw new Error('Не удалось загрузить заметки. Проверьте сервер и нажмите «Обновить».')
    }
    const notes: Note[] = await response.json()
    if (!signal.aborted) {
      this.setState({ notes })
    }
  }

  runRequest = async (action: (signal: AbortSignal) => Promise<void>) => {
    if (this.controller) return

    const controller = new AbortController()
    this.controller = controller
    this.setState({ busy: true, error: '' })

    try {
      await action(controller.signal)
    } catch (error) {
      if (!controller.signal.aborted) {
        this.setState({
          error: error instanceof TypeError
            ? 'Нет связи с сервером. Запустите npm run server и нажмите «Обновить».'
            : error instanceof Error ? error.message : 'Произошла ошибка запроса.'
        })
      }
    } finally {
      if (this.controller === controller) {
        this.controller = null
        if (!controller.signal.aborted) {
          this.setState({ busy: false })
        }
      }
    }
  }

  handleRefresh = () => {
    void this.runRequest(this.loadNotes)
  }

  handleContentChange = (content: string) => {
    this.setState({ content })
  }

  handleAdd = () => {
    const content = this.state.content.trim()
    if (!content) {
      this.setState({ error: 'Введите текст заметки.' })
      return
    }

    void this.runRequest(async (signal) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 0, content }),
        signal
      })
      if (!response.ok) throw new Error('Не удалось добавить заметку. Попробуйте ещё раз.')
      if (!signal.aborted) this.setState({ content: '' })
      await this.loadNotes(signal)
    })
  }

  handleDelete = (id: number) => {
    void this.runRequest(async (signal) => {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE', signal })
      if (!response.ok) throw new Error('Не удалось удалить заметку. Попробуйте ещё раз.')
      await this.loadNotes(signal)
    })
  }

  render() {
    const { notes, content, busy, error } = this.state

    return (
      <main className="notes-app">
        <header className="page-header">
          <div>
            <p className="eyebrow">Всё важное под рукой</p>
            <h1>Заметки</h1>
          </div>
          <button className="refresh-button" type="button" onClick={this.handleRefresh} disabled={busy}>
            <span aria-hidden="true">↻</span> Обновить
          </button>
        </header>

        {error && <p className="error" role="alert">{error}</p>}
        <p className="list-status" role="status">
          {busy ? 'Выполняется запрос…' : `Заметок: ${notes.length}`}
        </p>

        <section aria-label="Список заметок" aria-busy={busy}>
          <NotesList notes={notes} onDelete={this.handleDelete} disabled={busy} />
          {!busy && !error && notes.length === 0 && (
            <div className="empty-state">
              <h2>Пока нет заметок</h2>
              <p>Добавьте первую заметку в форме ниже.</p>
            </div>
          )}
        </section>

        <NotesForm
          content={content}
          onChange={this.handleContentChange}
          onAdd={this.handleAdd}
          disabled={busy}
        />
      </main>
    )
  }
}

export default App
