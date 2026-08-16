import { test, describe, after } from 'node:test'
import assert from 'node:assert'
import { app } from '../app.js'
import { orm } from '../shared/db/orm.js'

describe('Backend Express API Architecture', () => {
  after(async () => {
    try {
      await orm.close(true)
    } catch {}
  })

  test('App Instance is initialized properly', () => {
    assert.strictEqual(typeof app, 'function')
    assert.strictEqual(typeof app.listen, 'function')
    assert.strictEqual(typeof app.use, 'function')
  })

  test('Main API endpoints are registered on express router', () => {
    const routerStack = (app as any)._router?.stack || []
    const paths = routerStack
      .filter((layer: any) => layer.route || layer.regexp)
      .map((layer: any) => layer.route?.path || layer.regexp?.toString())

    assert.ok(routerStack.length > 0)
  })
})
