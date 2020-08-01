import { SmtpClient } from "smtp";
import { ConnectConfigWithAuthentication } from "smtpConfig";
import config from "./config.ts";

const client = new SmtpClient();

export default {
  async sendEmail(
    { from, to, subject, content, tls = true}: {
      from: string;
      to: string;
      subject: string;
      content: string;
      tls?: boolean;
    },
  ) {
    try {
      if (tls) {
        await client.connectTLS(<ConnectConfigWithAuthentication> config);
      } else {
        await client.connect(<ConnectConfigWithAuthentication> config);
      }

      await client.send({
        from: from,
        to: to,
        subject: subject,
        content: content,
      });

      await client?.close();

      return { error: false, message: "Email successfully sent" };
    } catch (error) {
      await client?.close();
      console.log(error.message);
      return { error: true, message: error.message };
    }
  },
};
