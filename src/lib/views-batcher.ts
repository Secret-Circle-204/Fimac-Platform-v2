type BatchCallback = (views: number) => void

class ViewsBatcher {
  private queue: Map<string, BatchCallback[]> = new Map()
  private timer: NodeJS.Timeout | null = null
  private delay = 50 // ms to wait for batching

  register(id: string, callback: BatchCallback) {
    const callbacks = this.queue.get(id) || []
    callbacks.push(callback)
    this.queue.set(id, callbacks)

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.delay)
    }
  }

  private async flush() {
    this.timer = null
    const ids = Array.from(this.queue.keys())
    if (ids.length === 0) return

    const currentQueue = new Map(this.queue)
    this.queue.clear()

    try {
      const res = await fetch(`/api/properties/views?ids=${ids.join(',')}`)
      if (res.ok) {
        const data = await res.json() as Record<string, number>
        for (const [id, views] of Object.entries(data)) {
          const callbacks = currentQueue.get(id)
          if (callbacks) {
            callbacks.forEach(cb => cb(views))
          }
        }
      }
    } catch (err) {
      console.error('Error fetching batch views:', err)
    }
  }
}

export const viewsBatcher = typeof window !== 'undefined' ? new ViewsBatcher() : null
