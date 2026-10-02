/**
 * Generic starting-point legal copy for a UAE maintenance business. It is NOT legal advice —
 * review with a qualified UAE legal adviser and edit in Admin → Legal Pages before launch.
 */
export const legalPages = (companyName: string, email: string) => [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `<p><em>This policy is a general template provided for convenience and does not constitute legal advice. Please review it with a qualified adviser.</em></p>
<h2>1. Who we are</h2><p>${companyName} ("we", "us") provides general and building maintenance services in the United Arab Emirates. This policy explains how we collect and use personal information when you use our website and services.</p>
<h2>2. Information we collect</h2><ul><li>Contact details you provide, such as your name, email address, phone and WhatsApp number.</li><li>Property and request details, including location, property type, descriptions and photos you upload.</li><li>Account information if you register for a customer account.</li><li>Technical information such as IP address and browser type, used for security and to improve the website.</li></ul>
<h2>3. How we use information</h2><ul><li>To respond to quote, contact and service requests.</li><li>To contact you by your preferred method (phone, WhatsApp or email).</li><li>To manage your customer account and request history.</li><li>To keep our website secure and prevent misuse.</li><li>To meet legal and regulatory obligations.</li></ul>
<h2>4. Sharing</h2><p>We do not sell personal information. We share it only with team members and service providers who need it to deliver our services (for example hosting and email providers), or where required by law.</p>
<h2>5. Retention</h2><p>We keep information only for as long as needed for the purposes above or as required by applicable law.</p>
<h2>6. Your choices</h2><p>You may request access to, correction of, or deletion of your personal information by contacting us at ${email}.</p>
<h2>7. Cookies</h2><p>We use essential cookies to keep you signed in securely. If analytics are enabled in future, this policy will be updated accordingly.</p>
<h2>8. Contact</h2><p>Questions about this policy can be sent to ${email}.</p>`,
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    content: `<p><em>These terms are a general template provided for convenience and do not constitute legal advice. Please review them with a qualified adviser.</em></p>
<h2>1. About these terms</h2><p>These terms govern your use of the ${companyName} website and the submission of quote, contact and service requests.</p>
<h2>2. Requests and quotations</h2><p>Submitting a request through the website does not create a booking or a binding contract. Our team will contact you to confirm scope, pricing and scheduling. Work proceeds only once you accept a quotation or service agreement.</p>
<h2>3. No online payments</h2><p>The website does not take online payments or bookings. Payment terms are agreed directly with you in your quotation or service agreement.</p>
<h2>4. Maintenance packages</h2><p>Package coverage, inclusions, hours and spare parts limits are defined in the individual package agreement. Information on the website is a summary and may change.</p>
<h2>5. Customer responsibilities</h2><p>Please provide accurate information, safe access to the property and notice of any known hazards.</p>
<h2>6. Accounts</h2><p>You are responsible for keeping your account credentials secure. We may suspend accounts that are misused.</p>
<h2>7. Liability</h2><p>Our liability is limited as set out in the applicable quotation or service agreement and to the extent permitted by UAE law.</p>
<h2>8. Governing law</h2><p>These terms are governed by the laws of the United Arab Emirates as applied in the Emirate of Abu Dhabi.</p>
<h2>9. Contact</h2><p>For questions about these terms, contact ${email}.</p>`,
  },
  {
    slug: 'cancellation-refund-policy',
    title: 'Cancellation & Refund Policy',
    content: `<p><em>This policy is a general template provided for convenience and does not constitute legal advice. Please review it with a qualified adviser.</em></p>
<h2>1. Requests</h2><p>Quote and service requests submitted through the website can be withdrawn at any time before work is confirmed, at no charge.</p>
<h2>2. Scheduled visits</h2><p>If you need to cancel or reschedule an agreed visit, please inform us as early as possible by phone, WhatsApp or email.</p>
<h2>3. Maintenance packages</h2><p>Cancellation terms for maintenance packages are set out in the individual package agreement.</p>
<h2>4. Refunds</h2><p>Where a refund is due under your agreement, it will be processed using the original payment method within a reasonable time, in line with applicable UAE regulations.</p>
<h2>5. Contact</h2><p>To request a cancellation or ask about refunds, contact ${email}.</p>`,
  },
];
