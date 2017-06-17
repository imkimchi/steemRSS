import Koa from 'koa'
import serve from 'koa-static'
import logger from 'koa-logger'

import router from './routes'

const app = new Koa()
const port = process.env.PORT || 3000
const dist = path.join(__dirname, '..', 'dist')


app
  .use(logger())
  .use(router())
  .use(serve(dist))

app.listen(port, () => console.log(`[!] Server is Running on ${port}`))