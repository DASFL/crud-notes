import { createServer } from 'node:http'

const notes = []
let nextId = 1
const port = 7070

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method === 'OPTIONS') {
    response.writeHead(204).end()
    return
  }

  const pathname = new URL(request.url, `http://localhost:${port}`).pathname

  if (request.method === 'GET' && pathname === '/notes') {
    response.end(JSON.stringify(notes))
    return
  }

  if (request.method === 'POST' && pathname === '/notes') {
    try {
      let body = ''
      for await (const chunk of request) {
        body += chunk
        if (body.length > 100_000) {
          response.writeHead(413).end(JSON.stringify({ error: 'Заметка слишком большая.' }))
          return
        }
      }
      const data = JSON.parse(body)
      if (typeof data?.content !== 'string' || !data.content.trim()) {
        response.writeHead(400).end(JSON.stringify({ error: 'Введите текст заметки.' }))
        return
      }
      notes.push({ id: nextId++, content: data.content.trim() })
      response.writeHead(204).end()
    } catch {
      response.writeHead(400).end(JSON.stringify({ error: 'Некорректный JSON.' }))
    }
    return
  }

  if (request.method === 'DELETE' && /^\/notes\/\d+$/.test(pathname)) {
    const id = Number(pathname.split('/').pop())
    const index = notes.findIndex((note) => note.id === id)
    if (index !== -1) notes.splice(index, 1)
    response.writeHead(204).end()
    return
  }

  response.writeHead(404).end(JSON.stringify({ error: 'Адрес не найден.' }))
})

server.listen(port, 'localhost', () => {
  console.log(`Сервер заметок: http://localhost:${port}/notes`)
})
