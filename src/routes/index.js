import Router from 'koa-router'
import steem from 'steem'
import RSS from 'rss'

const router = new Router({ prefix: '/'})

router.get('/:tag', async (ctx, next) => {
    let sex = await rssGenerator(this.param.tag)
    console.log(sex)
})

const rssGenerator = async tag => {
    let feedOption = {
        title: 'Steemit RSS',
        feed_url: `https://steemitrss.com/${tag}`,
        site_url: `https://steemit.com/created/${tag}`,
        image_url: 'https://steemit.com/images/steemit-share.png',
        docs: 'https://imkimchi.github.io/steemit-rss'
    }

    let result = await steem.api.getDiscussionsByCreated({"tag": tag, "limit": 5})
    let feed = new RSS(feedOption)
    await feed.item(result)
    return feed.xml({indent: true})
}

export default router