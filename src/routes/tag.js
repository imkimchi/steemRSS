import Router from 'koa-router'
import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'

const router = new Router({ prefix: '/rss' })

router.get('/:tag', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGenerator(ctx.params.tag)
})

const rssGenerator = async tag => {
    let feedOption = {
        title: 'Steemit RSS',
        feed_url: `https://steemitrss.com/${tag}`,
        site_url: `https://steemit.com/created/${tag}`,
        image_url: 'https://steemit.com/images/steemit-share.png',
        docs: 'https://imkimchi.github.io/steemit-rss'
    }

    let apiResponse = await steem.api.getDiscussionsByCreated({"tag": tag, "limit": 5})
    let feed = new RSS(feedOption)

    let completedFeed = await feedItem(feed, apiResponse)
    console.log(typeof completedFeed.xml())
    return completedFeed.xml()
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