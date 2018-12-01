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
    const res = await queue.processKeyed('test', sleep(100, 'ok'))
    expect(res).toEqual('ok')
  })
  it('Can instantiate a queue and add multiple task', async () => {
    const queue = new KeyedPromiseQueue()
    const res1 = await queue.processKeyed('test', sleep(100, '1'))
    const res2 = await queue.processKeyed('test1', sleep(150, 2))
    const res3 = await queue.processKeyed('test2', sleep(100, '3'))
    expect(res1).toStrictEqual('1')
    expect(res2).toStrictEqual(2)
    expect(res3).toStrictEqual('3')
  })

  it('Same key should return initial promise', async () => {
    const queue = new KeyedPromiseQueue()
    const obj1 = { test: 1 }
    const obj2 = { test: 2 }
    queue.processKeyed('test', sleep(100, obj1))
    const res2 = await queue.processKeyed('test', sleep(100, obj2))
    expect(res2).toStrictEqual(obj1)
  })

  it('Same key but after initial resolution should return new promise', async () => {
    const queue = new KeyedPromiseQueue()
    const obj1 = { test: 1 }
    const obj2 = { test: 2 }
    await queue.processKeyed('test', sleep(100, obj1))
    const res2 = await queue.processKeyed('test', sleep(100, obj2))
    expect(res2).toStrictEqual(obj2)
  })

  it('Inherited class', async () => {
    const queue = new InheritedClass()
    const obj1 = { test: 1 }
    const obj2 = { test: 2 }
    queue.processKeyed('test', sleep(100, obj1))
    const res2 = await queue.processKeyed('test', sleep(100, obj2))
    expect(res2).toStrictEqual(obj1)
  })

  it('DummyClass is instantiable', () => {
    expect(new globalObject()).toBeInstanceOf(KeyedPromiseQueue)
  })
})
