import { getCachedCompanySettings } from "@/lib/cache/company-settings"

export const metadata = {
  title: "Terms of Service | FIMAC Platform",
  description: "Read the terms and conditions for using the FIMAC investment platform.",
  keywords: ["terms of service", "FIMAC agreement", "legal agreement"],
  alternates: {
    canonical: '/terms-of-service',
  },
}

export default async function TermsOfServicePage() {
  const settings = await getCachedCompanySettings()
  const contactEmail = settings.contactEmail || ""
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="bg-blue-fimac text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold">Terms of Service</h1>
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
                YOUR BINDING AND UNCONDITIONAL AGREEMENT TO THESE TERMS OF SERVICE IN THEIR ENTIRETY.
                THIS PLATFORM AND ALL OF ITS ASSOCIATED SERVICES ARE STRICTLY CONDITIONAL UPON YOUR
                ACCEPTANCE OF THESE TERMS. IF YOU DO NOT AGREE TO BE BOUND BY THESE TERMS OF SERVICE,
                YOU ARE NOT AUTHORIZED TO USE THIS PLATFORM AND MUST IMMEDIATELY DISCONTINUE ALL ACCESS
                AND USE.
              </p>
            </div>

            <h2>1. Definitions</h2>
            <ul>
              <li>
                <strong>&quot;Platform&quot;</strong> refers to the FIMAC website, application, and
                all associated services, features, and content.
              </li>
              <li>
                <strong>&quot;FIMAC&quot;</strong>, <strong>&quot;Fimac Group&quot;</strong>, <strong>&quot;Company&quot;</strong>,{" "}
                <strong>&quot;we&quot;</strong>, <strong>&quot;our&quot;</strong>, or{" "}
                <strong>&quot;us&quot;</strong> refers to Financial Investment Management Advisory
                &amp; Consultants (also known as Fimac Group).
              </li>
              <li>
                <strong>&quot;User&quot;</strong>, <strong>&quot;you&quot;</strong>, or{" "}
                <strong>&quot;your&quot;</strong> refers to any individual or entity accessing or
                using the Platform.
              </li>
              <li>
                <strong>&quot;Buyer&quot;</strong> refers to a registered user with an active
                buyer account.
              </li>
              <li>
                <strong>&quot;Seller&quot;</strong> refers to any individual or entity that submits
                a property listing request through the Platform.
              </li>
              <li>
                <strong>&quot;Content&quot;</strong> refers to all text, images, data, information,
                listings, documents, and materials available on or through the Platform.
              </li>
              <li>
                <strong>&quot;Services&quot;</strong> refers to all features, tools, and
                functionalities provided through the Platform.
              </li>
            </ul>

            <h2>2. Acceptance and Eligibility</h2>
            <p>
              By accessing or using the Platform, you represent and warrant that: (a) you are at
              least 18 years of age; (b) you have the legal capacity and authority to enter into
              these Terms; (c) you are not prohibited from using the Platform under any applicable
              law or regulation; and (d) all information you provide is truthful, accurate, current,
              and complete.{" "}
              <strong>
                If you are entering into these Terms on behalf of a company or other legal entity,
                you represent that you have the authority to bind such entity to these Terms. If you
                do not agree, please do not use our Platform.
              </strong>
            </p>

            <h2>3. Description of Services</h2>
            <p>
              Fimac Group provides a digital platform that provides qualified buyers with access to
              exclusive hospitality properties. Our services include, but are not limited to:
            </p>
            <ul>
              <li>Property listing, showcase, and marketing services</li>
              <li>Buyer account registration, management, and verification</li>
              <li>Investment advisory information and market insights</li>
              <li>Facilitated communication between parties through the Platform</li>
            </ul>
            <p>
              <strong>
                FIMAC ACTS SOLELY AS AN INTERMEDIARY PLATFORM. WE DO NOT ACT AS A REAL ESTATE
                BROKER, AGENT, FINANCIAL ADVISOR, ATTORNEY, OR FIDUCIARY IN ANY CAPACITY. WE DO NOT
                PROVIDE LEGAL, TAX, FINANCIAL, OR INVESTMENT ADVICE. ALL INFORMATION ON THE PLATFORM
                IS FOR INFORMATIONAL PURPOSES ONLY AND SHOULD NOT BE CONSTRUED AS PROFESSIONAL
                ADVICE. YOU SHOULD CONSULT WITH QUALIFIED PROFESSIONALS BEFORE MAKING ANY INVESTMENT
                DECISIONS.
              </strong>
            </p>

            <h2>4. User Accounts</h2>

            <h3>4.1 Registration</h3>
            <p>
              To access certain features, you must create a buyer account using your email
              address or through Google Sign-In. You are solely responsible for:
            </p>
            <ul>
              <li>Providing and maintaining accurate, complete, and current account information</li>
              <li>Maintaining the security and confidentiality of your login credentials</li>
              <li>
                All activities and transactions that occur under your account, whether authorized or
                unauthorized
              </li>
              <li>
                Immediately notifying FIMAC of any unauthorized access to or use of your account
              </li>
            </ul>
            <p>
              <strong>
                FIMAC SHALL NOT BE LIABLE FOR ANY LOSS, DAMAGE, OR LIABILITY ARISING FROM YOUR
                FAILURE TO COMPLY WITH THE ABOVE OBLIGATIONS OR FROM UNAUTHORIZED ACCESS TO YOUR
                ACCOUNT.
              </strong>
            </p>

            <h3>4.2 Account Verification and Due Diligence</h3>
            <p>
              FIMAC reserves the absolute right, at its sole discretion, to verify the identity,
              financial qualifications, and background of any User. You may be required to provide
              proof of funds, government-issued identification, or other documentation. Failure to
              comply with verification requests may result in restricted access or account
              termination. FIMAC makes no representation regarding the verification status of any
              User on the Platform.
            </p>

            <h3>4.3 Account Suspension and Termination</h3>
            <p>
              We reserve the right to suspend, restrict, or permanently terminate your account at
              any time, with or without cause, with or without prior notice, and without any
              liability to you. Grounds for termination include, but are not limited to: violation
              of these Terms, suspected fraudulent activity, inactivity, or any conduct deemed
              harmful to the Platform, other Users, or FIMAC.
            </p>

            <h2>5. Disclaimer of Information Accuracy</h2>
            <p>
              <strong>
                WHILE FIMAC ENDEAVORS TO PRESENT ACCURATE PROPERTY INFORMATION, WE MAKE NO
                WARRANTIES, REPRESENTATIONS, OR GUARANTEES — WHETHER EXPRESS, IMPLIED, OR STATUTORY
                — REGARDING THE ACCURACY, COMPLETENESS, RELIABILITY, TIMELINESS, OR SUITABILITY OF
                ANY LISTING INFORMATION, INCLUDING BUT NOT LIMITED TO PROPERTY DESCRIPTIONS,
                VALUATIONS, FINANCIAL PROJECTIONS, ZONING, CAPACITY LIMITS, LAND AREA, PHOTOGRAPHS,
                DIMENSIONS, OR ANY OTHER DATA DISPLAYED ON THE PLATFORM.
              </strong>{" "}
              All listing information is provided by independent sources and has not been
              independently verified by FIMAC unless explicitly stated otherwise. Buyers are
              strongly advised to conduct thorough independent due diligence, including but not
              limited to property inspections, title searches, financial audits, and consultation
              with qualified legal and financial professionals before entering into any transaction.
            </p>

            <h2>6. No Guarantee of Transactions or Returns</h2>
            <p>
              <strong>
                FIMAC DOES NOT GUARANTEE THAT: (A) ANY PROPERTY LISTING WILL RESULT IN A COMPLETED
                TRANSACTION; (B) ANY INVESTMENT WILL GENERATE A RETURN OR PROFIT; (C) ANY FINANCIAL
                PROJECTIONS OR ESTIMATES PRESENTED ON THE PLATFORM ARE ACCURATE OR WILL BE ACHIEVED;
                (D) ANY PROPERTY WILL APPRECIATE IN VALUE; OR (E) ANY BUYER OR SELLER ON THE PLATFORM
                IS TRUSTWORTHY, CREDITWORTHY, OR WILL FULFILL THEIR OBLIGATIONS.
              </strong>
              All investment decisions are made at your own risk and sole discretion. Past
              performance is not indicative of future results.
            </p>

            <h2>7. Intellectual Property Rights</h2>
            <p>
              All content on the Platform, including but not limited to text, graphics, logos,
              trademarks, trade names, icons, images, audio clips, video clips, data compilations,
              software, and the overall design and arrangement thereof (collectively,
              &quot;Intellectual Property&quot;), is the exclusive property of FIMAC or its
              licensors and is protected by applicable copyright, trademark, patent, trade secret,
              and other intellectual property laws. You may not reproduce, distribute, modify,
              create derivative works of, publicly display, publicly perform, republish, download,
              store, transmit, or commercially exploit any of the Intellectual Property without the
              prior written consent of FIMAC, except as expressly permitted by these Terms.
            </p>

            <h2>8. Prohibited Activities</h2>
            <p>You expressly agree that you will NOT:</p>
            <ul>
              <li>Use the Platform for any unlawful, fraudulent, or unauthorized purpose</li>
              <li>Provide false, misleading, or deceptive information</li>
              <li>
                Attempt to gain unauthorized access to other accounts, computer systems, or networks
              </li>
              <li>
                Interfere with, disrupt, or place an undue burden on the Platform or its
                infrastructure
              </li>
              <li>
                Use any automated system, bot, scraper, or data mining tool to access the Platform
              </li>
              <li>
                Harvest, collect, or store personal information of other Users without their consent
              </li>
              <li>Transmit viruses, malware, trojans, or any harmful or disruptive code</li>
              <li>Circumvent or attempt to circumvent any security features of the Platform</li>
              <li>Use the Platform to compete with or create a competing service to FIMAC</li>
              <li>Engage in money laundering, terrorist financing, or any sanctioned activity</li>
              <li>
                Violate any applicable local, state, national, or international law or regulation
              </li>
              <li>
                Disclose confidential information obtained through the Platform to unauthorized
                parties
              </li>
            </ul>
            <p>
              Violation of these prohibitions may result in immediate account termination and may
              subject you to civil and criminal liability.
            </p>

            <h2>9. Confidentiality and Non-Disclosure</h2>
            <p>
              Access to certain property details, financials, and proprietary information may
              require execution of a Non-Disclosure Agreement (NDA). By signing the Platform NDA
              (electronically or otherwise), you irrevocably agree to: (a) maintain strict
              confidentiality of all confidential information; (b) not disclose, share, copy, or
              distribute any confidential information to any third party; (c) use confidential
              information solely for evaluating potential investment opportunities; and (d) return
              or destroy all confidential information upon request.{" "}
              <strong>
                Breach of NDA obligations may result in immediate legal action, including injunctive
                relief and monetary damages.
              </strong>
            </p>

            <h2>10. DISCLAIMER OF WARRANTIES</h2>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM AND ALL CONTENT,
                SERVICES, AND FEATURES ARE PROVIDED ON AN &quot;AS IS&quot;, &quot;AS
                AVAILABLE&quot;, AND &quot;WITH ALL FAULTS&quot; BASIS WITHOUT WARRANTIES OR
                CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. FIMAC
                HEREBY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO: (A) IMPLIED
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
                NON-INFRINGEMENT; (B) WARRANTIES ARISING FROM COURSE OF DEALING, USAGE, OR TRADE
                PRACTICE; (C) WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE,
                ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; (D) WARRANTIES REGARDING
                THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY INFORMATION, ESTIMATES, OR CONTENT;
                AND (E) WARRANTIES THAT THE PLATFORM WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS.
              </strong>
            </p>

            <h2>11. LIMITATION OF LIABILITY AND LEGAL RELEASE</h2>
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FIMAC, ITS
                OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUCCESSORS, OR ASSIGNS BE LIABLE
                FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE
                DAMAGES, OR LOSS OF CAPITAL, AND YOU HEREBY IRREVOCABLY RELEASE FIMAC AND ALL RELATED
                PARTIES FROM ANY AND ALL RECOVERY FOR DIRECT OR INDIRECT LOSSES. THIS LIMITATION AND
                RELEASE COVERS, WITHOUT LIMITATION: (A) LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF
                DATA, LOSS OF BUSINESS OPPORTUNITIES, LOSS OF GOODWILL, OR COST OF PROCUREMENT OF
                SUBSTITUTE SERVICES; (B) YOUR USE OF OR INABILITY TO USE THE PLATFORM; (C) ANY TRANSACTION,
                DISPUTE, OR RELATIONSHIP BETWEEN YOU AND ANY THIRD PARTY (INCLUDING OTHER USERS,
                BUYERS, OR SELLERS) THROUGH THE PLATFORM; (D) ANY CONTENT, MATERIAL, PROPERTY
                VALUATIONS, OR ZONING INFORMATION OBTAINED THROUGH THE PLATFORM; (E) UNAUTHORIZED
                ACCESS TO, ALTERATION OF, OR BREACH OF YOUR DATA; (F) ANY INVESTMENT DECISION MADE
                BASED ON INFORMATION AVAILABLE ON THE PLATFORM; OR (G) ANY OTHER MATTER RELATED TO
                THE PLATFORM, REGARDLESS OF THE LEGAL THEORY (WARRANTY, CONTRACT, TORT, OR STRICT
                LIABILITY), AND REGARDLESS OF WHETHER FIMAC HAS BEEN ADVISED OF THE POSSIBILITY OF
                SUCH DAMAGES.
              </strong>
            </p>
            <p>
              <strong>
                IN ANY EVENT, FIMAC&apos;S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF
                OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE GREATER OF: (A) THE
                TOTAL AMOUNT PAID BY YOU TO FIMAC IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM; OR
                (B) ONE HUNDRED US DOLLARS ($100.00 USD). THIS LIMITATION APPLIES REGARDLESS OF THE
                FORM OF ACTION OR THEORY OF LIABILITY.
              </strong>
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless FIMAC, its officers, directors,
              employees, agents, affiliates, licensors, and service providers from and against any
              and all claims, actions, demands, proceedings, liabilities, damages, losses, costs,
              and expenses (including reasonable attorneys&apos; fees and court costs) arising out
              of or related to: (a) your use of or access to the Platform; (b) your violation of
              these Terms; (c) your violation of any applicable law, regulation, or third-party
              right; (d) any content, data, or information you submit or transmit through the
              Platform; (e) your negligence or willful misconduct; or (f) any transaction or dispute
              between you and any third party. This indemnification obligation shall survive the
              termination of these Terms and your use of the Platform.
            </p>

            <h2>13. Assumption of Risk</h2>
            <p>
              <strong>
                YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE PLATFORM AND ANY INVESTMENT
                DECISIONS MADE IN CONNECTION WITH THE PLATFORM ARE AT YOUR SOLE AND EXCLUSIVE RISK.
                REAL ESTATE INVESTMENT INVOLVES SIGNIFICANT RISKS, INCLUDING BUT NOT LIMITED TO
                MARKET VOLATILITY, ILLIQUIDITY, REGULATORY CHANGES, ENVIRONMENTAL LIABILITIES, AND
                TOTAL LOSS OF INVESTED CAPITAL. FIMAC DOES NOT EVALUATE THE SUITABILITY OF ANY
                INVESTMENT FOR YOUR PARTICULAR CIRCUMSTANCES. YOU ARE SOLELY RESPONSIBLE FOR ALL
                INVESTMENT DECISIONS AND THEIR OUTCOMES.
              </strong>
            </p>

            <h2>14. Third-Party Services and Integrations</h2>
            <p>
              The Platform may integrate with or contain links to third-party services, including
              but not limited to Google OAuth for authentication. Your use of such third-party
              services is governed by their respective terms and privacy policies. FIMAC is not
              responsible for, does not endorse, and makes no representations regarding any
              third-party services, their content, their privacy practices, or their availability.
            </p>

            <h2>15. Dispute Resolution</h2>

            <h3>15.1 Negotiation</h3>
            <p>
              In the event of any dispute, claim, or controversy arising out of or relating to these
              Terms or the Platform (&quot;Dispute&quot;), the parties shall first attempt to
              resolve the Dispute through good-faith negotiation for a period of thirty (30) days
              following written notice of the Dispute.
            </p>

            <h3>15.2 Binding Arbitration</h3>
            <p>
              If a Dispute cannot be resolved through negotiation, the Dispute shall be submitted to
              final and binding arbitration. The arbitration shall be conducted in accordance with
              recognized arbitration rules. The arbitrator&apos;s decision shall be final and
              binding on all parties, and judgment upon the award may be entered in any court of
              competent jurisdiction.
            </p>

            <h3>15.3 Class Action Waiver</h3>
            <p>
              <strong>
                YOU AND FIMAC AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY
                ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
                YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION OR CLASS-WIDE ARBITRATION.
              </strong>
            </p>

            <h2>16. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by, construed, and enforced in accordance
              with the applicable laws of the jurisdiction in which FIMAC is incorporated, without
              regard to its conflict of law provisions. You consent to the exclusive jurisdiction
              and venue of the courts located within such jurisdiction for any actions not subject
              to arbitration.
            </p>

            <h2>17. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a
              court of competent jurisdiction, such finding shall not affect the validity, legality,
              or enforceability of the remaining provisions. The invalid provision shall be modified
              to the minimum extent necessary to make it valid and enforceable while preserving its
              original intent.
            </p>

            <h2>18. Entire Agreement</h2>
            <p>
              These Terms, together with the Privacy Policy, any NDAs executed through the Platform,
              and any other agreements expressly referenced herein, constitute the entire agreement
              between you and FIMAC and supersede all prior and contemporaneous understandings,
              agreements, representations, and warranties, both written and oral, regarding the
              subject matter hereof.
            </p>

            <h2>19. No Waiver</h2>
            <p>
              The failure of FIMAC to enforce any right or provision of these Terms shall not
              constitute a waiver of such right or provision. No waiver shall be effective unless
              made in writing and signed by an authorized representative of FIMAC.
            </p>

            <h2>20. Force Majeure</h2>
            <p>
              FIMAC shall not be liable for any delay or failure in performance resulting from
              causes beyond our reasonable control, including but not limited to acts of God,
              natural disasters, epidemics, pandemics, war, terrorism, riots, government actions,
              embargoes, power failures, internet outages, telecommunications failures, or
              cyberattacks.
            </p>

            <h2>21. Changes to Terms</h2>
            <p>
              FIMAC reserves the right to modify, amend, or update these Terms at any time and for
              any reason at its sole discretion. Changes will be effective immediately upon posting
              to the Platform with an updated &quot;Last updated&quot; date. Your continued use of
              the Platform following the posting of revised Terms constitutes your binding
              acceptance of such changes.{" "}
              <strong>
                If you do not agree with the updated terms, you must immediately cease using the
                Platform. It is your responsibility to review these Terms periodically.
              </strong>
            </p>

            <h2>22. Contact Information</h2>
            <p>
              For questions, concerns, or legal inquiries regarding these Terms of Service, please
              contact:
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
