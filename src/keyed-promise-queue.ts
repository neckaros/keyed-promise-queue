// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
interface IResolver {
  reject: () => void
  resolve: () => void
}
export class KeyedPromiseQueue {
  public readonly keyedQueue = new Map<string, Promise<any>>()

  processKeyed<T>(key: string, process: Promise<T>): Promise<T> {
    if (this.keyedQueue.has(key)) {
      console.log('exist')
      return this.keyedQueue.get(key)!
    }
    const promessCleaner = process.then(p => {
      this.keyedQueue.delete(key)
      return p
    })
    this.keyedQueue.set(key, process)

    return promessCleaner
  }
}
