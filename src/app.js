import Koa from 'koa'
import logger from 'koa-logger'

import routes from './routes'

const app = new Koa()
const port = process.env.PORT || 3000

app
  .use(logger())
  .use(routes())

app.listen(port, () => console.log("[!] Server STARTED"))