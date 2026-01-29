import { emailQueue } from "./email.queue.js";
import { sendEmail } from "./email.service.js";    

emailQueue.process(10, async (job) => {
    const { to, subject, html } = job.data;
    console.log(`[WORKER] Processing email job for ${to}`);
    try {
        await sendEmail(to, subject, html);
        console.log(`[WORKER] Email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        console.error(`[WORKER] Failed to send email to ${to}:`, error.message);
        throw error;
    }
});

emailQueue.on('failed', (job, err) => {
    console.error(`[WORKER] Email job failed for ${job.data.to}:`, err.message);
});

emailQueue.on('completed', (job) => {
    console.log(`[WORKER] Email job completed: ${job.id}`);
});