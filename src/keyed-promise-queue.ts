// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
interface IResolver {
  reject: Reject
  resolve: Resolve
}
type Resolve = (value?: any | PromiseLike<any>) => void
type Reject = (reason?: any) => void

interface IGlobalOptions {
  timeout?: number
  semaphore?: number
}
export class KeyedPromiseQueue {
  public queueSize = 0
  public readonly keyedQueue = new Map<string, { resolve: Resolve; reject: Reject }[]>()
  public readonly pendingQueue: Array<{ key: string; process: () => PromiseLike<any> }> = []

  constructor(public options: IGlobalOptions = {}) {}

  processKeyed<T>(key: string, process: () => PromiseLike<T>): PromiseLike<T> {
    if (this.keyedQueue.has(key)) {
      const resolvers = this.keyedQueue.get(key)!
      return new Promise((resolve, reject) => resolvers.push({ resolve, reject }))
    }
    const promess = new Promise<T>((resolve, reject) =>
      this.keyedQueue.set(key, [{ resolve, reject }])
    )
    // if (options.timeout || this.options.timeout) {
    //   this.timeout(options.timeout || this.options.timeout!);
    // }

    // const promessCleaner = process().then(p => {
    //   console.log('cleaning')
    //   this.keyedQueue.delete(key)
    //   this.queueSize--;
    //   this.take();
    //   return p
    // })
    this.pendingQueue.push({ key, process })
    this.take()
    return promess
  }

  async take() {
    // console.log('checking', this.pendingQueue.length, this.queueSize);
    if (this.pendingQueue.length > 0) {
      if (!this.options.semaphore || this.queueSize < this.options.semaphore) {
        const el = this.pendingQueue.shift()!
        this.queueSize++
        if (this.options.timeout) {
          await this.timeout(this.options.timeout)
        }
        el.process().then(r => {
          const resolvers = this.keyedQueue.get(el.key)!
          for (const resolver of resolvers) {
            resolver.resolve(r)
          }
          this.keyedQueue.delete(el.key)
          this.queueSize--
          this.take()
        })
      }
    }
  }

  timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
