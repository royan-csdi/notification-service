export default interface INotification {
  id?: string
  message: string
  type: string
  userId: string
  isRead: boolean
  createdAt?: Date
  updatedAt?: Date
}
