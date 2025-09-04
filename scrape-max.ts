import { chromium } from 'playwright';
import * as fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

async function fetchMaxTransactions(month: number, year: number, cardLast4: string) {
    const browser = await chromium.launch({ headless: false }); // Set to true for headless automation
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = 'https://www.max.co.il/transaction-details/personal';
    await page.goto(url);
    console.log('Login and select a card if required. Press any key to continue...');
    process.stdin.once('data', async () => {
        // Select the credit card matching the provided last 4 digits
        await page.click(`text="${cardLast4}"`);
        await page.waitForTimeout(1000);
        
        // Adjust selectors below according to the site's real structure!
        await page.selectOption('select[name="month"]', month.toString().padStart(2, '0'));
        await page.selectOption('select[name="year"]', year.toString());
        await page.waitForTimeout(2000);
        // Change this selector to match the transaction rows
        const rows = await page.$$('.transaction-row'); // Adjust .transaction-row!
        const data = [];
        for (const row of rows) {
            const cells = await row.$$('td');
            const values = [];
            for (const cell of cells) {
                values.push((await cell.innerText()).trim());
            }
            data.push({
                date: values[0],
                merchant: values[1],
                category: values[2],
                type: values[3],
                fx: values[4] || '',
