import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 서버(5173)로 온 /api 요청을 프로젝트 3의 API 서버(3000)로 넘겨 줍니다.
    // 브라우저 입장에서는 같은 주소로 요청하므로 CORS 설정이 필요 없습니다.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
