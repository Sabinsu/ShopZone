const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"ShopZone" <${process.env.SMTP_USER}>`;

exports.sendOrderConfirmation = async ({ to, name, orderId, items, total }) => {
  const itemsHtml = items
    .map(i => `<tr><td>${i.name}</td><td>×${i.qty}</td><td>$${i.price.toFixed(2)}</td></tr>`)
    .join('');
  await transporter.sendMail({
    from: FROM, to,
    subject: `Order Confirmed — #${orderId}`,
    html: `
      <h2>Hi ${name}, your order is confirmed!</h2>
      <table border="1" cellpadding="8">${itemsHtml}</table>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
      <p>Order ID: <strong>${orderId}</strong></p>
    `,
  });
};

exports.sendSellerApproval = async ({ to, name }) => {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Your Seller Account is Approved!',
    html: `<h2>Congratulations ${name}!</h2><p>Your seller account on ShopZone has been approved. You can now start listing products.</p>`,
  });
};

exports.sendPasswordReset = async ({ to, name, resetUrl }) => {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Password Reset Request',
    html: `<h2>Hi ${name},</h2><p>Reset your password here (expires in 1 hour):</p><a href="${resetUrl}">${resetUrl}</a>`,
  });
};
