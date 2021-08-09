const playwright = require('playwright')
const fetch = async () => {
  const t1 = Date.now()
  const browser = await playwright.launch({
    args: [
      '--no-sandbox',
      // '--disable-setuid-sandbox',
      // '--disable-dev-shm-usage',
      // '--single-process'
    ],
  })
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
      req.abort()
    } else {
      req.continue()
    }
  })
  await page.goto('https://adamant.finance/home')
  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('.farms-card-item')
    return cards.length > 100
  })
  const result = await page.$$eval('.farms-card-item', (farms) => {
    return farms
      .map((farm) => {
        const rkey = Object.keys(farm).find((k) => k.startsWith('__reactInternalInstance'))
        if (!rkey) return undefined
        return farm[rkey].return.memoizedProps.pool
      })
      .filter(Boolean)
  })
  const t2 = Date.now()
  console.log(`spend time: ${Math.round((t2 - t1) / 1000)}s}`)

  await page.close()
  await browser.close()
  if (result.length > 0) return result
  return []
}

fetch().then(r => {
  console.log(r)
})


