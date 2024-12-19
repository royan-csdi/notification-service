import express from "express"
import { env } from "@/configs"
import { startKafkaConsumer } from "./services/kafka.service"

const app = express()

startKafkaConsumer().catch((error) => console.error(error))

app.listen(env.APP.PORT, () => {
  console.log(`[Server] - Listening on port ${env.APP.PORT}`)
})
