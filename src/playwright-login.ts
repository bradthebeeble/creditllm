import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { LoginSession } from './types';

/**
 * Playwright login automation function
 * 
 * This function handles automated login to financial websites
 * with support for MFA integration
 * 
 * @returns Promise<LoginSession> - Returns login session details
 */
export async function playwrightLogin(): Promise<LoginSession> {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  try {
    // Launch browser with appropriate settings for financial sites
    browser = await chromium.launch({
      headless: false, // Set to true for production
      slowMo: 1000, // Slow down by 1s for demo purposes
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    // Create new browser context with user-agent
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      // Add extra headers to appear more human-like
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    page = await context.newPage();

    // TODO: Replace with actual login URL
    const loginUrl = process.env.BANK_LOGIN_URL || 'https://example-bank.com/login';
    
    console.log(`Navigating to: ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: 'networkidle' });

    // TODO: Replace with actual login form selectors
    const usernameSelector = '#username';
    const passwordSelector = '#password';
    const loginButtonSelector = '#login-btn';

    // Wait for login form to be available
    await page.waitForSelector(usernameSelector, { timeout: 10000 });
    
    // Fill login credentials
    const username = process.env.BANK_USERNAME;
    const password = process.env.BANK_PASSWORD;
    
    if (!username || !password) {
      throw new Error('Username and password must be provided via environment variables');
    }

    console.log('Filling login credentials...');
    await page.fill(usernameSelector, username);
    await page.fill(passwordSelector, password);
    
    // Click login button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click(loginButtonSelector)
    ]);

    // Check if MFA is required
    await handleMFA(page);

    // Verify successful login
    const isLoggedIn = await verifyLogin(page);
    if (!isLoggedIn) {
      throw new Error('Login verification failed');
    }

    console.log('Login successful!');

    // Create and return login session
    const session: LoginSession = {
      sessionId: generateSessionId(),
      loginTime: new Date(),
      browser: browser,
      context: context,
      page: page,
      isActive: true
    };

    return session;

  } catch (error) {
    console.error('Login failed:', error);
    
    // Cleanup on failure
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
    
    throw error;
  }
}

/**
 * Handle Multi-Factor Authentication (MFA)
 * 
 * This function detects and handles various MFA methods:
 * - SMS codes
 * - Email codes
 * - Authenticator app codes
 * - Push notifications
 * 
 * @param page - Playwright page instance
 */
async function handleMFA(page: Page): Promise<void> {
  console.log('Checking for MFA requirements...');
  
  try {
    // Wait briefly to see if MFA screen appears
    await page.waitForTimeout(2000);
    
    // Check for various MFA indicators
    const mfaSelectors = [
      '[data-testid="mfa-code"]',
      '#mfa-code',
      '.mfa-input',
      'input[name*="code"]',
      'input[placeholder*="code"]'
    ];
    
    let mfaElement = null;
    for (const selector of mfaSelectors) {
      try {
        mfaElement = await page.waitForSelector(selector, { timeout: 3000 });
        if (mfaElement) break;
      } catch {
        // Continue checking other selectors
      }
    }
    
    if (mfaElement) {
      console.log('MFA detected. Waiting for user input...');
      
      // TODO: Implement MFA handling strategies:
      // 
      // Option 1: Wait for manual user input
      // await waitForManualMFAInput(page);
      // 
      // Option 2: Integrate with SMS/Email polling
      // const mfaCode = await pollForMFACode();
      // await mfaElement.fill(mfaCode);
      // 
      // Option 3: Integrate with authenticator app
      // const totpCode = await generateTOTPCode();
      // await mfaElement.fill(totpCode);
      // 
      // Option 4: Handle push notifications
      // await waitForPushNotificationApproval();
      
      // For now, wait for manual input with timeout
      await waitForManualMFAInput(page, mfaElement);
      
      console.log('MFA completed');
    } else {
      console.log('No MFA required');
    }
  } catch (error) {
    console.log('MFA handling completed or skipped:', error.message);
  }
}

/**
 * Wait for manual MFA input from user
 */
async function waitForManualMFAInput(page: Page, mfaElement: any): Promise<void> {
  console.log('Please enter MFA code manually...');
  
  // Wait for the MFA input to be filled (user types it)
  await page.waitForFunction(
    (element) => element.value.length >= 4, // Assuming minimum 4-digit code
    mfaElement,
    { timeout: 120000 } // 2 minutes timeout
  );
  
  // Look for and click submit button
  const submitSelectors = [
    'button[type="submit"]',
    '#mfa-submit',
    '.mfa-submit',
    'button:has-text("Submit")',
    'button:has-text("Verify")',
    'button:has-text("Continue")'
  ];
  
  for (const selector of submitSelectors) {
    try {
      const submitBtn = await page.waitForSelector(selector, { timeout: 2000 });
      if (submitBtn) {
        await submitBtn.click();
        break;
      }
    } catch {
      // Continue checking other selectors
    }
  }
  
  // Wait for navigation after MFA submission
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
}

/**
 * Verify successful login by checking for account/dashboard elements
 */
async function verifyLogin(page: Page): Promise<boolean> {
  const successIndicators = [
    '.account-summary',
    '.dashboard',
    '#account-balance',
    '[data-testid="account-overview"]',
    '.welcome-message'
  ];
  
  for (const selector of successIndicators) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      // Continue checking other indicators
    }
  }
  
  // Also check if we're still on login page (indicates failure)
  const stillOnLogin = await page.url().includes('login');
  return !stillOnLogin;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean up login session resources
 */
export async function closeLoginSession(session: LoginSession): Promise<void> {
  try {
    if (session.page) await session.page.close();
    if (session.context) await session.context.close();
    if (session.browser) await session.browser.close();
    session.isActive = false;
    console.log(`Session ${session.sessionId} closed successfully`);
  } catch (error) {
    console.error('Error closing session:', error);
  }
}
