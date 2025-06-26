import {
  SendEmailCommandInput,
  SendEmailCommandOutput,
  SES,
} from "@aws-sdk/client-ses";

class EmailClient {
  private static instance: EmailClient;
  private ses: SES;

  private constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing AWS credentials: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in the environment variables.",
      );
    }

    this.ses = new SES({
      region: process.env.AWS_REGION || "eu-west-2", // Default region if not specified
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  static getInstance(): EmailClient {
    if (!EmailClient.instance) {
      EmailClient.instance = new EmailClient();
    }
    return EmailClient.instance;
  }

  async sendEmail(
    params: SendEmailCommandInput,
  ): Promise<SendEmailCommandOutput> {
    try {
      return await this.ses.sendEmail(params);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default EmailClient;

// Usage example:
// const emailClient = EmailClient.getInstance('us-east-1');
// emailClient.sendEmail({
//   Source: 'sender@example.com',
//   Destination: { ToAddresses: ['recipient@example.com'] },
//   Message: {
//     Subject: { Data: 'Test Email' },
//     Body: { Text: { Data: 'This is a test email.' } },
//   },
// });
