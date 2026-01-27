import { emailQueue } from "./email.queue.js";
import { sendEmail } from "./email.service.js";    

emailQueue.process(10, async (job) => { 
    const { to, subject, html } = job.data;
    await sendEmail(to, subject, html);
}   );

emailQueue.on('failed', (job, err) => {
    console.error(`Email job failed for ${job.data.to}:`, err);
});