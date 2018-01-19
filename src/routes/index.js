import compose from 'koa-compose'
import tagRouter from './tag'
import steem from 'steem'

steem.api.setOptions({ url: 'wss://rpc.buildteam.io/' });
const routes = [ tagRouter ]

export default () => compose([].concat(
  ...routes.map(r => [r.routes(), r.allowedMethods()])
))