import Router from 'koa-router'
import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'

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
    'feed': () => steem.api.getDiscussionsByFeed(query),
    'blog': () => steem.api.getDiscussionsByBlog(query),
    'new': () => steem.api.getDiscussionsByCreated(query),
    'hot': () => steem.api.getDiscussionsByHot(query),
    'trend': () => steem.api.getDiscussionsByTrending(query)
}

const getContent = async (category, tag) => {
    let query = { 'tag':tag, 'limit':10 }
    
    if(methodMap.hashasOwnProperty(category)) {
        return await menu[category]()
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
