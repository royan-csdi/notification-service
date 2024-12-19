import { consumer, TOPICS } from "@/configs/kafka.config"
import { INotification } from "@/interfaces"
import { prisma } from "@/prisma/clients"
import { CustomError } from "@/utils"

type NotificationPayload = {
  userId: string
  projectName?: string
  taskName?: string
  action: string
}

const createNotification = async (data: Omit<INotification, "id">) => {
  return await prisma.mst_notification.create({
    data: {
      ...data,
      isRead: false,
    },
  })
}

const handleProjectChange = async (payload: NotificationPayload) => {
  await createNotification({
    userId: payload.userId,
    type: "project",
    message: `Project ${payload.projectName} has been ${payload.action}`,
    isRead: false,
  })
}

const handleTaskChange = async (payload: NotificationPayload) => {
  await createNotification({
    userId: payload.userId,
    type: "task",
    message: `Task ${payload.taskName} has been ${payload.action}`,
    isRead: false,
  })
}

const processMessage = async (topic: string, payload: NotificationPayload) => {
  const handlers = {
    [TOPICS.PROJECT_CHANGES]: handleProjectChange,
    [TOPICS.TASK_CHANGES]: handleTaskChange,
  }

  const handler = handlers[topic as keyof typeof handlers]
  if (handler) {
    await handler(payload)
  }
}

export const startKafkaConsumer = async () => {
  try {
    await consumer.connect()
    await consumer.subscribe({
      topics: [TOPICS.PROJECT_CHANGES, TOPICS.TASK_CHANGES],
    })

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const value = message.value?.toString()
        if (!value) return

        const payload = JSON.parse(value) as NotificationPayload
        await processMessage(topic, payload)
      },
    })
  } catch (error: any) {
    throw new CustomError(500, error.message)
  }
}
