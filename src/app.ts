import express from "express"
import { env } from "@/configs"

const app = express()

app.listen(env.APP.PORT, () => {
  console.log(`[Server] - Listening on port ${env.APP.PORT}`)
})
