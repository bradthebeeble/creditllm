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
        // Select the credit card using the HTML select box by finding option with matching last 4 digits
        try {
            // Look for a select element that contains card options with last 4 digits
            const cardSelector = 'select[name="card"], select[id*="card"], select[class*="card"]';
            
            // Try to find the card select box and select by value containing last 4 digits
            const cardSelectExists = await page.$(cardSelector);
            if (cardSelectExists) {
                await page.selectOption(cardSelector, { label: new RegExp(cardLast4) });
            } else {
                // Fallback: try to select option by text content containing last 4 digits
                await page.selectOption('select', { label: new RegExp(cardLast4) });
            }
        } catch (error) {
            console.log('Could not find card select box, trying alternative method...');
            // Fallback to clicking text containing the card digits
            await page.click(`text="${cardLast4}"`);
        }
        
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
                amount: values[5] || '',
                balance: values[6] || ''
            });
        }
        
        // Write to CSV
        const csvWriter = createCsvWriter({
            path: `max_transactions_${month}_${year}_${cardLast4}.csv`,
            header: [
                { id: 'date', title: 'Date' },
                { id: 'merchant', title: 'Merchant' },
                { id: 'category', title: 'Category' },
                { id: 'type', title: 'Type' },
                { id: 'fx', title: 'FX' },
                { id: 'amount', title: 'Amount' },
                { id: 'balance', title: 'Balance' }
            ]
        });
        
        await csvWriter.writeRecords(data);
        console.log(`Exported ${data.length} transactions to CSV`);
        
        await browser.close();
    });
}

// Example usage
fetchMaxTransactions(9, 2024, '4611');
