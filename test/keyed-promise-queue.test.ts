import { KeyedPromiseQueue } from '../src/keyed-promise-queue'
import { KeyedPromiseQueue as globalObject } from '../src'
const sleep = <T>(time: number, result: T, throwit?: string) =>
  new Promise<T>(function(resolve, reject) {
    setTimeout(function() {
      resolve(result)
    }, time)
  })

class InheritedClass extends KeyedPromiseQueue {}

describe('Class test', () => {
  it('Can instantiate a queue and add one task', async () => {
    const queue = new KeyedPromiseQueue()
    const res = await queue.processKeyed('test', () => sleep(100, 'ok'))
    expect(res).toEqual('ok')
  })
  it('Can instantiate with a global delay', async () => {
    const queue = new KeyedPromiseQueue({ timeout: 50 })
    const prom = queue.processKeyed('test', () => sleep(100, 'ok'))

    const res = await prom

    expect(res).toEqual('ok')
  })

  it('Can instantiate with a Semaphore', async () => {
    const queue = new KeyedPromiseQueue({ semaphore: 1 })
    const res = queue.processKeyed('test', () => sleep(400, 'ok'))
    const res2 = queue.processKeyed('test2', () => sleep(400, 'Do'))
    const res3 = queue.processKeyed('test3', () => sleep(400, '3'))
    const [ret, ret2, ret3] = await Promise.all([res, res2, res3])
    expect(ret).toEqual('ok')
    expect(ret2).toEqual('Do')
    expect(ret3).toEqual('3')
  })

  it('Can instantiate with a Semaphore 1', async () => {
    const queue = new KeyedPromiseQueue({ semaphore: 1 })
    let resolve1: (value?: {} | PromiseLike<{}>) => void
    let resolve2: (value?: {} | PromiseLike<{}>) => void
    const promess1 = () =>
      new Promise(async (resolve, reject) => {
        console.log('called1')
        resolve1 = resolve
        await sleep(100, 1)
        expect(resolve2).toBeUndefined()
        resolve(1)
      })
    const promess2 = () =>
      new Promise(async resolve => {
        console.log('called2')
        resolve2 = resolve
        expect(resolve1).toBeDefined()
        await sleep(100, 2)
        resolve(2)
      })
    const res = queue.processKeyed('test', promess1)
    const res2 = queue.processKeyed('test2', promess2)
    const [ret1, ret2] = await Promise.all([res, res2])
    expect(ret1).toEqual(1)
    expect(ret2).toEqual(2)
  })

  it('Can instantiate a queue and add multiple task', async () => {
    const queue = new KeyedPromiseQueue()
    const res1 = await queue.processKeyed('test', () => sleep(100, '1'))
    const res2 = await queue.processKeyed('test1', () => sleep(150, 2))
    const res3 = await queue.processKeyed('test2', () => sleep(100, '3'))
    expect(res1).toStrictEqual('1')
    expect(res2).toStrictEqual(2)
    expect(res3).toStrictEqual('3')
  })

  it('Same key should return initial promise and not call second one', async () => {
    const queue = new KeyedPromiseQueue()
    const obj1 = { test: 1 }
    const obj2 = { test: 2 }
    let called = false
    queue.processKeyed('test', () => sleep(100, obj1))
    const res2 = await queue.processKeyed('test', () => {
      called = true
      return sleep(100, obj2)
    })
    expect(res2).toStrictEqual(obj1)
    expect(called).toBeFalsy()
  })

  it('Same key but after initial resolution should return new promise', async () => {
    const queue = new KeyedPromiseQueue()
    const obj1 = { test: 1 }
    const obj2 = { test: 2 }
    await queue.processKeyed('test', () => sleep(100, obj1))
    const res2 = await queue.processKeyed('test', () => sleep(100, obj2))
    expect(res2).toStrictEqual(obj2)
  })

  it('Inherited class', async () => {
    const queue = new InheritedClass()
    const obj1 = { test: 1 }
    const obj2 = { test: 2 }
    queue.processKeyed('test', () => sleep(100, obj1))
    const res2 = await queue.processKeyed('test', () => sleep(100, obj2))
    expect(res2).toStrictEqual(obj1)
  })

  it('DummyClass is instantiable', () => {
    expect(new globalObject()).toBeInstanceOf(KeyedPromiseQueue)
  })
})
