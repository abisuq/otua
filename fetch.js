const fetchDinoPools = require('./dino')
const fetchAdaPools = require('./adamant')
const playwright = require('playwright')

const main = async ()=> {
	const browser = await playwright.chromium.launch({ args: ['--no-sandbox'] })
	await Promise.all([
    fetchAdaPools(browser).catch(e => console.log(e)),
		fetchDinoPools(browser).catch(e => console.log(e))
	])
	await browser.close()
}
main()
