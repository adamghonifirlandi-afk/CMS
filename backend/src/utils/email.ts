import nodemailer from "nodemailer";

function isSmtpConfigured(): boolean {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
    );
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendPasswordResetEmail(
    email: string,
    resetToken: string
) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetURL = `${frontendUrl}/reset-password?token=${resetToken}`;

    if (!isSmtpConfigured()) {
        if (process.env.NODE_ENV === "development") {
            console.log("SMTP not configured — password reset link:", resetURL);
            return { success: true, skipped: true };
        }
        throw new Error("Email service is not configured");
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"CMS Demo" <noreply@example.com>',
        to: email,
        subject: "Password Reset Request",
        html: `
            <h1>Reset Your Password</h1>
            <p>You requested a password reset for your CMS demo account.</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
            <p>This link expires in 24 hours.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
}