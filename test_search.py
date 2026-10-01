import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 400, 'height': 800})
        
        page.on('console', lambda msg: print(f'Console: {msg.text}'))
        page.on('pageerror', lambda err: print(f'Error: {err}'))
        
        await page.goto('http://localhost:8080')
        await page.wait_for_timeout(2000)
        
        await page.click('#searchToggle')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='search_open.png')
        
        await page.fill('#searchInput', 'jbl')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='search_typed.png')
        
        await browser.close()

asyncio.run(main())
