const playwright = require('playwright')
const fs = require('fs')
const fetch = async () => {
  const t1 = Date.now()
  const browser = await playwright.chromium.launch({
    args: [
      '--no-sandbox',
      // '--disable-setuid-sandbox',
      // '--disable-dev-shm-usage',
      // '--single-process'
    ],
  })
  const page = await browser.newPage()
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
const main = async () => {
  const newPools = await fetch()
  let currentPools = []
  try {
    currentPools = JSON.parse(fs.readFileSync('./pools.json').toString())
  } catch (e) {}
  const newVaultAddressList = newPools
    .slice(1)
    .map((p) => p.vaultAddress)
    .filter(Boolean)
  for (const pool of currentPools.slice(1)) {
    if (newVaultAddressList.includes(pool.vaultAddress)) continue
    newPools.push({ ...pool, deprecated: true })
  }
  fs.writeFileSync('./pools.json', JSON.stringify(newPools))
}
main()
