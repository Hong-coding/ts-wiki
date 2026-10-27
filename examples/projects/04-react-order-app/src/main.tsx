import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './App.css'

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('index.html에 id="root" 요소가 없습니다.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
