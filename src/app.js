import Koa from 'koa'
import logger from 'koa-logger'

import router from './routes'

const app = new Koa()
const port = process.env.PORT || 3000

app
  .use(logger())
  .use(router())

app.listen(port, () => console.log("[!] Server STARTED"))