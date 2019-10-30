import { expectError, expectType } from 'tsd'
import Uppy = require('../')
import DefaultStore = require('@uppy/store-default')

{
  const uppy = Uppy<Uppy.StrictTypes>()
  uppy.addFile({
    data: new Blob([new ArrayBuffer(1024)], {
      type: 'application/octet-stream'
    })
  })

  uppy.upload().then(result => {
    expectType<Uppy.UploadedUppyFile<{}, {}>>(result.successful[0])
    expectType<Uppy.FailedUppyFile<{}, {}>>(result.failed[0])
  })
}

{
  const store = DefaultStore()
  const uppy = Uppy<Uppy.StrictTypes>({ store })
}

{
  const uppy = Uppy<Uppy.StrictTypes>()
  // this doesn't exist but type checking works anyway :)
  const f = uppy.getFile('virtual')
  if (f && f.progress && f.progress.uploadStarted === null) {
    f.progress.uploadStarted = Date.now()
  }

  if (f && f.response && f.response.status === 200) {
    expectType(f.response.body)
  }
  expectType<number>(f.response!.status)
}

{
  type Meta = {}
  type ResponseBody = {
    averageColor: string
  }
  const uppy = Uppy<Uppy.StrictTypes>()
  const f = uppy.getFile<Meta, ResponseBody>('virtual')!
  expectType<ResponseBody>(f.response!.body)
}

{
  const uppy = Uppy<Uppy.StrictTypes>()
  uppy.addFile({
    name: 'empty.json',
    data: new Blob(['null'], { type: 'application/json' }),
    meta: { path: 'path/to/file' }
  })
}

{
  interface SomeOptions extends Uppy.PluginOptions {
    types: 'are checked'
  }
  class SomePlugin extends Uppy.Plugin<SomeOptions> {}
  const untypedUppy = Uppy()
  untypedUppy.use(SomePlugin, { types: 'are unchecked' })
  const typedUppy = Uppy<Uppy.StrictTypes>()
  expectError(typedUppy.use(SomePlugin, { types: 'are unchecked' }))
  typedUppy.use(SomePlugin, { types: 'are checked' })

  // strictly-typed instance can be cast to a loosely-typed instance
  const widenUppy: Uppy.Uppy = Uppy<Uppy.StrictTypes>()
  // and disables the type checking
  widenUppy.use(SomePlugin, { random: 'nonsense' })
}
