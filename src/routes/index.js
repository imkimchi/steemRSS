import compose from 'koa-compose'
import tagRouter from './tag'

const routes = [ tagRouter ]

export default () => compose([].concat(
  ...routes.map(r => [r.routes(), r.allowedMethods()])
))