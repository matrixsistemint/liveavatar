import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 59989,
    allowedHosts: ['.matrix.web.id'],
    //https: true,  // basicSsl plugin menghandle cert-nya
  },
})
