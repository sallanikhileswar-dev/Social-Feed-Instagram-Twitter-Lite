const { deleteExpiredStories } = require('../controllers/storyController');

/**
 * Start cron jobs
 */
const startCronJobs = () => {
  // Clean up expired stories every hour
  setInterval(async () => {
    try {
      await deleteExpiredStories();
    } catch (error) {
      console.error('Cron job error:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  console.log('Cron jobs started');
};

module.exports = { startCronJobs };
