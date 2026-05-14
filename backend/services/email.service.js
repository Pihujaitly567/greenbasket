import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "pihu.jaitly2024@nst.rishihood.edu.in",
    pass: process.env.EMAIL_PASS || "your-app-password-here",
  },
});
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_PASS) {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return; 
    }
    const mailOptions = {
      from: `"GreenBasket" <${process.env.EMAIL_USER || "pihu.jaitly2024@nst.rishihood.edu.in"}>`,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = "Welcome to GreenBasket!";
  const html = `
    <h2>Welcome, ${userName}!</h2>
    <p>Thank you for registering at GreenBasket. Start shopping for fresh organic groceries today!</p>
  `;
  await sendEmail(userEmail, subject, html);
};
export const sendOrderConfirmationEmail = async (userEmail, orderId, amount) => {
  const subject = "Order Confirmation - GreenBasket";
  const html = `
    <h2>Order Confirmed!</h2>
    <p>Your order (ID: ${orderId}) has been placed successfully.</p>
    <p>Total Amount: ₹${amount}</p>
    <p>Thank you for shopping with us!</p>
  `;
  await sendEmail(userEmail, subject, html);
};
export const sendOrderStatusEmail = async (userEmail, orderId, status) => {
  const subject = `Order Update: ${status} - GreenBasket`;
  const html = `
    <h2>Order Status Update</h2>
    <p>Your order (ID: ${orderId}) status has been updated to: <strong>${status}</strong>.</p>
  `;
  await sendEmail(userEmail, subject, html);
};
