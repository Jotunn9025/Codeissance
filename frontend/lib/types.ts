export type SourceConnector = {
  id: string
  name: string
  status: "connected" | "syncing" | "error" | "paused"
  lastSync: string
}
