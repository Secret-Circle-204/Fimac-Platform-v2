import { getCachedCompanySettings } from "@/lib/cache/company-settings"

export const metadata = {
  title: "Privacy Policy | FIMAC Platform",
  description: "Learn how FIMAC collects, uses, and protects your personal information.",
  keywords: ["privacy policy", "FIMAC privacy", "data protection"],
  alternates: {
    canonical: '/privacy-policy',
  },
}

export default async function PrivacyPolicyPage() {
  const settings = await getCachedCompanySettings()
  const contactEmail = settings.contactEmail || ""
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="bg-blue-fimac text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-blue-100 mt-2">Last updated: July 16, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl prose prose-slate prose-lg">
            <div className="p-6 bg-red-50 border-l-4 border-red-600 rounded-r-lg mb-8">
              <p className="text-sm text-red-900 font-bold uppercase tracking-wide mb-2">
                IMPORTANT LEGAL NOTICE — PLEASE READ CAREFULLY
              </p>
              <p className="text-sm text-red-800 leading-relaxed font-semibold">
                BY ACCESSING, BROWSING, REGISTERING ON, OR USING THE FIMAC PLATFORM, YOU CONSTITUTE
                YOUR BINDING AND UNCONDITIONAL AGREEMENT TO THIS PRIVACY POLICY IN ITS ENTIRETY.
                THIS PLATFORM IS STRICTLY CONDITIONAL UPON YOUR ACCEPTANCE OF THESE TERMS. IF YOU DO
                NOT AGREE TO BE BOUND BY THIS PRIVACY POLICY, YOU ARE NOT AUTHORIZED TO USE THIS
                PLATFORM AND MUST IMMEDIATELY DISCONTINUE ALL ACCESS AND USE.
              </p>
            </div>

            <h2>1. Introduction</h2>
            <p>
              FIMAC (also referred to as &quot;Fimac Group&quot;, &quot;Financial Investment Management Advisory &amp; Consultants&quot;,
              &quot;we&quot;, &quot;our&quot;, &quot;us&quot;, or &quot;the Company&quot;) operates
              the FIMAC Platform (the &quot;Platform&quot;, &quot;Service&quot;, or
              &quot;Website&quot;). This Privacy Policy governs the manner in which we collect, use,
              maintain, and disclose information collected from users (&quot;User&quot;,
              &quot;you&quot;, or &quot;your&quot;) of the Platform. This Privacy Policy applies to
              the Platform and all products and services offered by Fimac Group.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide Directly</h3>
            <p>We collect information that you voluntarily provide when you:</p>
            <ul>
              <li>
                Create a buyer account (full name, email address, phone number, company name)
              </li>
              <li>
                Authenticate using third-party services such as Google OAuth (name, email address,
                profile image)
              </li>
              <li>Complete verification processes (proof of funds, identity documents)</li>
              <li>Sign a Non-Disclosure Agreement (NDA) through the Platform</li>
              <li>Contact us through any communication channel</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>
              When you access or use our Platform, we automatically collect certain technical
              information. For security and analytics purposes, this includes:
            </p>
            <ul>
              <li>
                <strong>Hashed IP Addresses:</strong> To protect user privacy while ensuring platform security and accurate usage tracking, your raw IP address is hashed using SHA-256 immediately upon receipt of a request. The raw IP address is never stored in plaintext within our databases.
              </li>
              <li>
                <strong>Approximate Geolocation Data:</strong> We resolve approximate geographical locations (such as city, region, and country) from these hashed IP records or incoming request headers. No precise GPS tracking or physical location mapping is performed.
              </li>
              <li>Browser type, version, and language preferences</li>
              <li>Operating system and device identifiers</li>
              <li>Pages visited, time spent, click patterns, and navigation paths</li>
              <li>Referring and exit URLs</li>
              <li>Date and time stamps of access</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>2.3 Third-Party Authentication Data (Google OAuth)</h3>
            <p>
              When you elect to sign in or register using Google OAuth, you explicitly authorize us
              to access and store the following information from your Google account: your full
              name, email address, unique Google account identifier, and profile picture.{" "}
              <strong>
                We do not access, store, or have visibility into your Google password, contacts,
                calendar, drive files, or any other Google account data beyond what is explicitly
                authorized through the OAuth consent screen.
              </strong>
            </p>

            <h2>3. Legal Basis for Processing</h2>
            <p>We process your personal information based on the following legal grounds:</p>
            <ul>
              <li>
                <strong>Consent:</strong> You have given explicit consent for processing for
                specific purposes
              </li>
              <li>
                <strong>Contractual Necessity:</strong> Processing is necessary for the performance
                of our services
              </li>
              <li>
                <strong>Legitimate Interest:</strong> Processing is necessary for our legitimate
                business interests, provided such interests do not override your fundamental rights
              </li>
              <li>
                <strong>Legal Obligation:</strong> Processing is necessary to comply with applicable
                laws and regulations
              </li>
            </ul>

            <h2>4. How We Use Your Information</h2>
            <p>We use the collected information strictly for the following purposes:</p>
            <ul>
              <li>To create, maintain, and administer your buyer account</li>
              <li>To facilitate communication regarding investment opportunities</li>
              <li>To verify your identity and financial qualifications</li>
              <li>To enforce our Terms of Service and applicable agreements including NDAs</li>
              <li>
                To send important platform updates, security alerts, and service notifications
              </li>
              <li>To improve, personalize, and optimize the Platform experience</li>
              <li>
                To analyze usage patterns and generate aggregated, anonymized statistical data
              </li>
              <li>
                To detect, prevent, and address fraud, security incidents, and technical issues
              </li>
              <li>
                To comply with legal obligations, regulatory requirements, and law enforcement
                requests
              </li>
            </ul>

            <h2>5. Information Sharing and Disclosure</h2>
            <p>
              <strong>
                We do not sell, trade, rent, or otherwise commercially exploit your personal
                information to any third party under any circumstances.
              </strong>{" "}
              We may share information only in the following limited circumstances:
            </p>
            <ul>
              <li>
                <strong>Service Providers:</strong> We may share information with third-party
                service providers that assist in operating the Platform (e.g., hosting
                infrastructure, email delivery). These providers may have access to your information
                only to the extent necessary to perform their functions on our behalf
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by applicable law, regulation,
                subpoena, court order, or governmental request, or when we believe in good faith
                that disclosure is necessary to protect our rights, your safety, or the safety of
                others
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with any merger, acquisition,
                reorganization, sale of assets, or bankruptcy proceeding, your information may be
                transferred as part of such transaction. By using the Platform, you acknowledge and
                consent to such transfer
              </li>
              <li>
                <strong>Platform Operations:</strong> When necessary for the operation, maintenance,
                and improvement of the Platform and our services
              </li>
            </ul>

            <h2>6. Data Security and Exclusion of Liability</h2>
            <p>
              We implement commercially reasonable and industry-standard technical and
              organizational security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction, including TLS/SSL encryption for data transmission, cryptographic hashing of credentials, and role-based access controls.
            </p>
            <p>
              <strong>
                NOTWITHSTANDING THE FOREGOING, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT NO METHOD OF
                ELECTRONIC TRANSMISSION OR STORAGE IS 100% SECURE. FIMAC DOES NOT GUARANTEE, WARRANT,
                OR REPRESENT THAT YOUR INFORMATION WILL BE COMPLETELY SECURE FROM AUTHORIZED OR
                UNAUTHORIZED ACCESS, USE, ALTERATION, BREACH, OR DESTRUCTION BY THIRD PARTIES.
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY AND ITS DIRECTORS,
                OFFICERS, EMPLOYEES, AND AGENTS ARE COMPLETELY EXONERATED AND DISCLAIMED FROM ANY
                AND ALL LIABILITY FOR DAMAGES OF ANY KIND (INCLUDING DIRECT, INDIRECT, SPECIAL,
                CONSEQUENTIAL, OR INCIDENTAL) ARISING FROM OR RELATING TO DATA BREACHES, SYSTEM
                FAILURES, OR UNAUTHORIZED INTERCEPTION OF DATA. ANY TRANSMISSION OF DATA TO OUR
                PLATFORM IS AT YOUR OWN SOLE RISK.
              </strong>
            </p>

            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to maintain authenticated sessions,
              remember user preferences, and analyze Platform usage. By using the Platform, you
              consent to our use of cookies as described herein. You may control cookie settings
              through your browser; however, disabling cookies may impair certain functionality of
              the Platform.
            </p>

            <h2>8. Your Choices</h2>
            <p>As a user of the Platform, you may:</p>
            <ul>
              <li>
                <strong>Rectification:</strong> Update or correct your account information at any
                time through your account settings
              </li>
              <li>
                <strong>Account Deletion:</strong> Request deletion of your account by contacting
                us. Please note that certain information may be retained as required by law or for
                legitimate business purposes (such as records of signed NDAs or completed
                transactions)
              </li>
              <li>
                <strong>Communication Preferences:</strong> Opt out of non-essential communications
                by contacting us
              </li>
            </ul>

            <h2>9. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account remains active, as
              needed to provide our services, or as required to comply with our legal obligations,
              resolve disputes, and enforce our agreements. Upon account deletion, we will remove or
              anonymize your personal data within a reasonable timeframe, except where retention is
              required by law or for legitimate business purposes (such as maintaining records of
              signed NDAs or completed transactions).
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than the
              country in which you reside. These countries may have data protection laws that differ
              from the laws of your country. By using the Platform, you consent to the transfer of
              your information to such countries. We take appropriate safeguards to ensure your
              personal data remains protected in accordance with this Privacy Policy.
            </p>

            <h2>11. Third-Party Links and Services</h2>
            <p>
              The Platform may contain links to third-party websites, services, or applications that
              are not operated or controlled by Fimac Group.{" "}
              <strong>
                This Privacy Policy does not apply to third-party services. Fimac Group is not
                responsible for, and completely disclaims any liability for, the privacy practices,
                content, or security of any external websites or services. Any access of external
                links is done at your own risk.
              </strong>{" "}
              We strongly encourage you to review the privacy policies of any third-party services
              before providing personal information.
            </p>

            <h2>12. Children&apos;s Privacy</h2>
            <p>
              The Platform is not intended for, nor directed to, individuals under the age of 18. We
              do not knowingly collect, solicit, or maintain personal information from anyone under
              18 years of age. If we learn that we have collected personal information from a child
              under 18, we will take steps to delete such information promptly. If you believe we
              have inadvertently collected information from a minor, please contact us immediately.
            </p>

            <h2>13. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at any time and for any
              reason at our sole discretion. Any changes will be effective immediately upon posting
              the revised Privacy Policy on this page with an updated &quot;Last updated&quot; date.
              Your continued use of the Platform after any changes constitutes your binding
              acceptance of the revised Privacy Policy.{" "}
              <strong>
                If you do not agree with the updated terms, you must immediately cease using the
                Platform. It is your sole responsibility to review this page periodically for any changes.
              </strong>
            </p>

            <h2>14. Governing Law</h2>
            <p>
              This Privacy Policy shall be governed by and construed in accordance with the laws
              applicable to the jurisdiction in which Fimac Group operates, without regard to conflict of
              law principles.
            </p>

            <h2>15. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, our
              data practices, or wish to exercise your data rights, please contact us at:
            </p>
            <ul>
              {contactEmail && (
                <li>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${contactEmail}`} className="text-blue-900 hover:underline">
                    {contactEmail}
                  </a>
                </li>
              )}
              <li>
                <strong>Website:</strong> <a href="/contact">Contact Page</a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
