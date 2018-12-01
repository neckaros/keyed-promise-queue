# keyed-promise-queue

A very simple class that you can extends from and add a keyed promise queue to avoid running same job concurently

[![Build Status](https://travis-ci.org/neckaros/keyed-promise-queue.svg?branch=master)](https://travis-ci.org/neckaros/keyed-promise-queue)
[![Coverage Status](https://coveralls.io/repos/github/neckaros/keyed-promise-queue/badge.svg?branch=master)](https://coveralls.io/github/neckaros/keyed-promise-queue?branch=master)

### Features

 - Add a promess to the queue with an unique key
 - if you add another promess with the same queue we will return the first promess
 - TypeScript typings built-in

## Usage

### Install

Yarn:
 ```sh
yarn add keyed-promise-queue
```

npm:
 ```sh
npm i keyed-promise-queue
```

### Create Queue
 ```typescript
const queue = new KeyedPromiseQueue();
const res = await queue.processKeyed('test', any_async_function());
```
### Inherit from the queue class
 ```typescript
 class InheritedClass extends KeyedPromiseQueue {
}
const queue = new InheritedClass();
const res = await queue.processKeyed('test', any_async_function());
```
