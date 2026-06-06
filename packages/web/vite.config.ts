import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next()

        const url = new URL(req.url, "http://localhost")
        const pathname = url.pathname

        // Read body for POST requests
        let body: any = undefined
        if (req.method === "POST") {
          body = await new Promise((resolve) => {
            let raw = ""
            req.on("data", (chunk) => { raw += chunk })
            req.on("end", () => {
              try { resolve(JSON.parse(raw)) } catch { resolve({}) }
            })
          })
        }

        // Dynamic import of mock handler
        const { handleMockApi } = await import("./src/lib/mockApi")
        const response = handleMockApi(pathname, req.method || "GET", body)

        if (response) {
          res.statusCode = 200
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          if (response.body) {
            const reader = response.body.getReader()
            const pump = async () => {
              while (true) {
                const { done, value } = await reader.read()
                if (done) { res.end(); return }
                res.write(value)
              }
            }
            pump()
          } else {
            const text = await response.text()
            res.end(text)
          }
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
})
