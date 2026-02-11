export class SubscriptionManager<T extends Function = VoidFunction> {
  private subscriptions: T[] = []

  add(handler: T): VoidFunction {
    this.subscriptions.push(handler)
    return () => {
      const index = this.subscriptions.indexOf(handler)
      if (index !== -1) {
        this.subscriptions.splice(index, 1)
      }
    }
  }

  notify(...args: any[]) {
    for (const handler of this.subscriptions) {
      handler(...args)
    }
  }

  getSize() {
    return this.subscriptions.length
  }

  clear() {
    this.subscriptions.length = 0
  }
}
