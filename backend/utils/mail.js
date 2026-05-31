import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. it exprires in 5 minutes.</p>`,
  });
};

export const sendDeliveryOtpMail = async (user, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Delivery Otp",
    html: `<p>Your OTP for Delivery is <b>${otp}</b>. it exprires in 5 minutes.</p>`,
  });
};

export const sendPromotionBroadcastMail = async (to, subject, message) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html: `<div>
      <h2>${subject}</h2>
      <p>${message}</p>
    </div>`,
  });
};

export const sendOrderDelayMail = async (to) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Order Delay Update",
    html: `<p>Your order is slightly delayed due to traffic/high demand.</p>`,
  });
};
