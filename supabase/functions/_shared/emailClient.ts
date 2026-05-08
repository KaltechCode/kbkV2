import { SmtpClient } from "jsr:@neabyte/deno-mailer";

const clients = new SmtpClient();
await clients.connect({
  hostname: Deno.env.get("SMTP_HOST") ?? "",
  port: Deno.env.get("SMTP_PORT"),
  username: Deno.env.get("SMTP_USER") ?? "",
  password: Deno.env.get("SMTP_PASS") ?? "",
});

export default clients;
