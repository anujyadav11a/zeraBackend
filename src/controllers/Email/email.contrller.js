import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { emailQueue } from "./email.queue.js";
import e from "express";

const sendEmails = asyncHandler(async (req, res, next) => {
     const { to, subject, html } = req.body;
     if (!to || !subject || !html) {
          return next(new ApiError(400, "Missing required fields: to, subject, html"));
     }
     try {
        await emailQueue.add(
               { to, subject, html }, 
               {
               attempts: 5,
               backoff: {
                    type: 'exponential',
                    delay: 2000
               },
               removeOnComplete: true,
               removeOnFail: 50
               
          }


          );
          return new ApiResponse(
               200, "Email job enqueued successfully"
          ).send(res);


          

     } catch (error) {
          return next(new ApiError(500, "Failed to enqueue email job"));
     }
});

export { sendEmails };