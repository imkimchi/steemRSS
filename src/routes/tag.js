import Router from 'koa-router'
import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'
import {promisify} from 'util'

let getDiscussionsByCreated = promisify(steem.api.getDiscussionsByCreated);
let getDiscussionsByFeed = promisify(steem.api.getDiscussionsByFeed);
let getDiscussionsByBlog = promisify(steem.api.getDiscussionsByBlog);
let getDiscussionsByHot = promisify(steem.api.getDiscussionsByHot);
let getDiscussionsByTrending = promisify(steem.api.getDiscussionsByTrending);

const router = new Router({ prefix: '' })

router.get('/:category/:tag', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGenerator(ctx.params.category, ctx.params.tag)   
})

const rssGenerator = async (category, tag) => {
    let feedOption = {
        title: 'Steemit RSS',
        feed_url: `https://steemitrss.com/${tag}`,
        site_url: `https://steemit.com/created/${tag}`,
        image_url: 'https://steemit.com/images/steemit-share.png',
        docs: 'https://imkimchi.github.io/steemit-rss'
    } 

    let apiResponse = await getContent(category, tag)
    let feed = new RSS(feedOption)
    let completedFeed = await feedItem(feed, apiResponse)
    return completedFeed.xml()
}

const methodMap = {
    'feed': (query) => getDiscussionsByFeed(query),
    'blog': (query) => getDiscussionsByBlog(query),
    'new': (query) => getDiscussionsByCreated(query),
    'hot': (query) => getDiscussionsByHot(query),
    'trend': (query) => getDiscussionsByTrending(query)
}

const getContent = async (category, tag) => {
    let query = { 'tag':tag, 'limit':10 }
    
    if(methodMap.hasOwnProperty(category)) {
        return await methodMap[category](query)
    } else {
        return Promise.reject(new Error("Unknown Category"));
    }
}

const feedItem = async (feed, response) => {
    console.log(response.length)
    for (let post of response) {
        feed.item({
            title: post.title,
            description: post.body,
            url: `https://steemit.com${post.url}`,
            categories: [post.category],
            author: post.author,
            date: post.created,
            custom_elements: [
                { 'votes': post.net_votes },
                { 'payout_value': post.pending_payout_value }
            ]
        })
    }
    return feed
}

export default router
