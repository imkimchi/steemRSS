import compose from 'koa-compose'
import tagRouter from './tag'
import steem from 'steem'

steem.api.setOptions({ url: 'https://api.steemit.com/' });
const routes = [ tagRouter ]

export default () => compose([].concat(
  ...routes.map(r => [r.routes(), r.allowedMethods()])
))