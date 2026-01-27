import { emailQueue } from "../src/controllers/Email/email.queue";
import { sendEmail } from "../src/controllers/Email/email.service";    

emailQueue.process(10, async (job) => { 
    const { to, subject, html } = job.data;
    await sendEmail(to, subject, html);
}   );

emailQueue.on('failed', (job, err) => {
    console.error(`Email job failed for ${job.data.to}:`, err);
});