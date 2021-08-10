const playwright = require('playwright')
const fs = require('fs')

const fetch = async () => {
  const browser = await playwright.chromium.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.goto('https://adamant.finance/home')
  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('.farms-card-item')
    return cards.length > 100
  })
  const result = await page.$$eval('.farms-card-item', (farms) => {
    return farms
      .map((farm) => {
        const getPoolName = (p) => {
          const name = p.nameOverride ?? p.singleAsset ? p.token1Name : p.token0Name + '/' + p.token1Name + ' LP'
          return p.beta
            ? name + ' (Beta)'
            : 'cometh' == p.platform
            ? name + ' (Cometh)'
            : 'sushi' == p.platform
            ? name + ' (Sushi)'
            : 'elk' == p.platform
            ? name + ' (Elk)'
            : 'polyzap' == p.platform
            ? name + ' (PolyZap)'
            : 'mai' == p.platform
            ? name + ' (QiDao)'
            : 'curve' == p.platform
            ? name + ' (Curve)'
            : 'wault' == p.platform
            ? name + ' (Wault)'
            : 'quick' == p.platform
            ? name + ' (Quick)'
            : 'augury' == p.platform
            ? name + ' (Augury)'
            : 'jet' == p.platform
            ? name + ' (Jet)'
            : 'ape' == p.platform
            ? name + ' (Ape)'
            : 'dino' == p.platform
            ? name + ' (Dino)'
            : 'yeld' == p.platform
            ? 'sushi' == p.exchange
              ? name + ' (Sushi)'
              : 'ape' == p.exchange
              ? name + ' (Ape)'
              : name + ' (Quick)'
            : name
        }
        const rkey = Object.keys(farm).find((k) => k.startsWith('__reactInternalInstance'))
        try {
          if (farm.href && farm.href.includes('/stakeaddy')) {
            return {
              name: 'Staking Addy',
              apr: farm.querySelector('.apy').innerText.split('%')[0],
            }
          }
          const p = farm[rkey].return.memoizedProps.pool
          if (!p) return undefined
          if (p.addyFeeShareApr) {
            return {
              name: 'ADDY/WETH LP (Quick)',
              apr: p.apr,
              addyFeeShareApr: p.addyFeeShareApr,
            }
          }
          return {
            name: getPoolName(p),
            lpAddress: p.lpAddress,
            vaultAddress: p.vaultAddress,
            strategyAddress: p.strategyAddress,
            apy: p.apy,
            baseApr: p.baseApr,
            addyTokenApr: p.addyTokenApr,
          }
        } catch (err) {
          return undefined
        }
      })
      .filter(Boolean)
  })

  await page.close()
  await browser.close()
  if (result.length > 1) return result
  return null
}
const main = async () => {
  const newPools = await fetch()
  if (!newPools) return
  let currentPools = []
  try {
    currentPools = JSON.parse(fs.readFileSync('./pools.json').toString())
  } catch (e) {}

  const newVaultAddressList = newPools.map((p) => p.vaultAddress).filter(Boolean)

  for (const pool of currentPools.filter((p) => p.vaultAddress)) {
    if (newVaultAddressList.includes(pool.vaultAddress)) continue
    newPools.push({ ...pool, deprecated: true })
  }

  fs.writeFileSync('./pools.json', JSON.stringify(newPools, null, 2))
}
main()
