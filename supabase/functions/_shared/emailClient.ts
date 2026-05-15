// import { SmtpClient } from "jsr:@neabyte/deno-mailer";

// const clients = new SmtpClient();
// await clients.connect({
//   hostname: Deno.env.get("SMTP_HOST") ?? "",
//   port: Deno.env.get("SMTP_PORT"),
//   username: Deno.env.get("SMTP_USER") ?? "",
//   password: Deno.env.get("SMTP_PASS") ?? "",
// });

// export default clients;

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer";

const transporter = nodemailer.createTransport({
  host: Deno.env.get("SMTP_HOST") ?? "",
  port: Deno.env.get("SMTP_PORT")
    ? parseInt(Deno.env.get("SMTP_PORT") ?? "465")
    : 465,
  secure: true,
  auth: {
    user: Deno.env.get("SMTP_USER") ?? "",
    pass: Deno.env.get("SMTP_PASS") ?? "",
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

export default transporter;
