import { App } from '@slack/bolt';
import { CronJob } from 'cron';
import { config } from './config';
import { LoginSession } from './types';
import { playwrightLogin } from './playwright-login';

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Store active login sessions
const activeSessions: Map<string, LoginSession> = new Map();

// Event handling skeleton
app.event('message', async ({ event, say }) => {
  // Handle incoming messages
  console.log('Received message:', event);
  
  // Add message handling logic here
});

// Slash command example
app.command('/login', async ({ command, ack, respond }) => {
  await ack();
  
  try {
    // Initiate login session
    const session = await playwrightLogin();
    activeSessions.set(command.user_id, session);
    
    await respond({
      text: 'Login session initiated successfully!',
      response_type: 'ephemeral'
    });
  } catch (error) {
    console.error('Login failed:', error);
    await respond({
      text: 'Login failed. Please try again.',
      response_type: 'ephemeral'
    });
  }
});

// Scheduled message functionality
const setupScheduledMessages = () => {
  // Example: Daily reminder at 9 AM
  const dailyReminder = new CronJob(
    '0 9 * * *', // 9 AM daily
    async () => {
      try {
        // Send scheduled message to a channel
        await app.client.chat.postMessage({
          channel: '#general', // Replace with your channel
          text: 'Good morning! Time for your daily update.',
        });
      } catch (error) {
        console.error('Failed to send scheduled message:', error);
      }
    },
    null,
    true,
    'America/New_York' // Replace with your timezone
  );

  // Example: Weekly summary on Fridays at 5 PM
  const weeklyReminder = new CronJob(
    '0 17 * * 5', // 5 PM on Fridays
    async () => {
      try {
        await app.client.chat.postMessage({
          channel: '#general',
          text: 'Weekly summary reminder!',
        });
      } catch (error) {
        console.error('Failed to send weekly reminder:', error);
      }
    },
    null,
    true,
    'America/New_York'
  );

  console.log('Scheduled messages configured');
};

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack bot is running!');
    
    // Setup scheduled messages
    setupScheduledMessages();
    
  } catch (error) {
    console.error('Failed to start the app:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Slack bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down Slack bot...');
  process.exit(0);
});
