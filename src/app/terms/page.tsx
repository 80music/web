import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "Terms of Service — Chordisol",
  description:
    "Terms and conditions governing your access to and use of the Chordisol iOS & iPadOS application and website.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service — Chordisol",
    description:
      "Terms and conditions governing your access to and use of the Chordisol iOS & iPadOS application and website.",
    url: "https://chordisol.com/terms",
    siteName: "Chordisol",
    locale: "en_US",
    type: "website",
  },
};

const TOC_ITEMS = [
  { id: "services", label: "1. Our Services" },
  { id: "ip", label: "2. Intellectual Property Rights" },
  { id: "accounts", label: "3. Accounts, Guest Access & Deletion" },
  { id: "prohibited", label: "4. Acceptable Use" },
  { id: "feedback", label: "5. Feedback & Web Photo Booth" },
  { id: "mobile", label: "6. Apple iOS & iPadOS Application License" },
  { id: "privacy", label: "7. Privacy Policy" },
  { id: "termination", label: "8. Term and Termination" },
  { id: "modifications", label: "9. Modifications and Availability" },
  { id: "law", label: "10. Governing Law & Dispute Resolution" },
  { id: "disclaimer", label: "11. Disclaimer" },
  { id: "liability", label: "12. Limitations of Liability" },
  { id: "indemnification", label: "13. Indemnification" },
  { id: "misc", label: "14. Miscellaneous" },
  { id: "contact", label: "15. Contact Us" },
] as const;

export default function TermsOfServicePage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col bg-white">
      <article className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20">
        {/* Navigation breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
            <span>Back to Chordisol</span>
          </Link>
        </div>

        {/* Page header */}
        <header className="border-b border-slate-200/80 pb-8 sm:pb-9">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="size-1.5 rounded-full bg-[#1674d6]" />
            <span>Legal &amp; Transparency</span>
          </div>
          <h1 className="mt-2.5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
            Last Updated: November 26, 2026
          </p>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
            These Terms of Service constitute a legally binding agreement governing your access to and use of the Chordisol iOS &amp; iPadOS application and website.
          </p>
        </header>

        {/* Agreement to Our Legal Terms (Preamble) */}
        <section
          aria-labelledby="preamble-heading"
          className="mt-8 sm:mt-10 rounded-2xl border-2 border-slate-200/90 bg-slate-50/60 p-5 sm:p-7 shadow-[0_2px_0_rgba(15,23,42,0.04)]"
        >
          <h2
            id="preamble-heading"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
          >
            Agreement to Our Legal Terms
          </h2>
          <div className="mt-4 space-y-4 text-[15px] sm:text-base leading-relaxed sm:leading-7 text-slate-600">
            <p>
              We are Chordisol (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). We operate the Chordisol mobile application for iOS and iPadOS (the &ldquo;App&rdquo;) and our website at{" "}
              <span className="font-medium text-slate-800">chordisol.com</span> (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p>
              You can contact us by email at{" "}
              <a
                href="mailto:support@chordisol.com"
                className="font-semibold text-[#1674d6] underline underline-offset-4 hover:text-[#0f5bb5]"
              >
                support@chordisol.com
              </a>
              .
            </p>
            <p>
              By accessing or using the Services, you agree to be bound by these Legal Terms. If you do not agree with these Legal Terms, you must discontinue use of the Services immediately.
            </p>
            <p>
              Users who are minors in their jurisdiction (generally under 18) must have permission from a parent or legal guardian to use the Services.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <nav
          aria-label="Table of contents"
          className="my-8 sm:my-10 rounded-2xl border-2 border-blue-100 bg-linear-to-b from-blue-50/50 to-blue-50/20 p-5 sm:p-7 shadow-[0_2px_0_rgba(22,116,214,0.06)]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-blue-100/80 pb-3.5">
            <h2 className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Table of Contents
            </h2>
            <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {TOC_ITEMS.length} Sections
            </span>
          </div>
          <ol className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2 sm:text-sm">
            {TOC_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-center justify-between py-1 text-slate-700 transition-colors hover:text-[#1674d6]"
                >
                  <span className="font-medium group-hover:underline">{item.label}</span>
                  <span aria-hidden="true" className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">&rarr;</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content sections */}
        <div className="space-y-10 sm:space-y-12 text-[15px] sm:text-base leading-relaxed sm:leading-7 text-slate-600">
          {/* 1. OUR SERVICES */}
          <section id="services" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              1. Our Services
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                Chordisol provides free, ad-free music-learning tools including on-device acoustic chord and note recognition, interactive ear-training lessons, adaptive practice exercises, and our web companion at chordisol.com.
              </p>
              <p>
                The Services are intended for personal, non-commercial educational use. Persons who access the Services from any jurisdiction do so on their own initiative and are responsible for compliance with applicable local laws.
              </p>
            </div>
          </section>

          {/* 2. INTELLECTUAL PROPERTY RIGHTS */}
          <section id="ip" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              2. Intellectual Property Rights
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We are the owner or licensee of all intellectual property rights in our Services, including source code, audio assets, lessons, graphics, illustrations, trademarks, and logos (collectively, the &ldquo;Content&rdquo; and &ldquo;Marks&rdquo;).
              </p>
              <p>
                Subject to your compliance with these Legal Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services solely for your personal, non-commercial use. No part of the Services may be copied, redistributed, sold, or exploited commercially without our prior written permission at{" "}
                <a
                  href="mailto:support@chordisol.com"
                  className="font-medium text-[#1674d6] hover:underline"
                >
                  support@chordisol.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* 3. ACCOUNTS, GUEST ACCESS & DELETION */}
          <section id="accounts" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              3. Accounts, Guest Access &amp; Deletion
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                You may use the Chordisol App immediately as a guest or create an account using Email &amp; Password, Sign in with Apple, or Google Sign-In to preserve your learning progress across devices.
              </p>
              <p>
                If you create an account, you agree to provide accurate information and keep your login credentials secure. You may delete your account and associated server-side progress at any time directly inside the App via{" "}
                <strong className="text-slate-900">Settings &rarr; Delete Account</strong>.
              </p>
            </div>
          </section>

          {/* 4. ACCEPTABLE USE */}
          <section id="prohibited" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              4. Acceptable Use
            </h2>
            <div className="mt-5 space-y-4">
              <p>As a user of the Services, you agree not to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Reverse engineer, decompile, disassemble, or attempt to derive the source code of the App or its bundled machine-learning models, except as permitted by applicable law.
                </li>
                <li>
                  Use automated scripts, bots, or scrapers to access, overload, or extract content from our APIs or website.
                </li>
                <li>
                  Attempt to bypass security controls, impersonate another user, or interfere with the operation of the Services.
                </li>
                <li>
                  Use the Services for any unlawful purpose or unauthorized commercial endeavor.
                </li>
              </ul>
            </div>
          </section>

          {/* 5. FEEDBACK & WEB PHOTO BOOTH */}
          <section id="feedback" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              5. Feedback &amp; Web Photo Booth
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                <strong className="text-slate-900">Feedback:</strong> If you send us questions, suggestions, or feedback regarding Chordisol, you agree that we may use that feedback to improve the Services without obligation or compensation to you.
              </p>
              <p>
                <strong className="text-slate-900">Web Photo Booth:</strong> The Chordisol App does not include public user-generated content feeds. If you use the optional Photo Booth on chordisol.com/booth, you retain ownership of your photos and represent that you have permission from anyone appearing in them.
              </p>
            </div>
          </section>

          {/* 6. APPLE iOS & iPadOS APPLICATION LICENSE */}
          <section id="mobile" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              6. Apple iOS &amp; iPadOS Application License
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                The following terms apply when you obtain the Chordisol App from the Apple App Store:
              </p>
              <ol className="list-decimal space-y-3 pl-6">
                <li>
                  The license granted to you for the App is limited to a non-transferable license to use the App on Apple-branded iOS or iPadOS devices that you own or control, in accordance with the Usage Rules set forth in the Apple Media Services Terms and Conditions.
                </li>
                <li>
                  Chordisol, and not Apple, is solely responsible for providing any maintenance and support services for the App as required under these Legal Terms or applicable law.
                </li>
                <li>
                  To the maximum extent permitted by applicable law, Apple has no warranty obligation whatsoever with respect to the App.
                </li>
                <li>
                  You represent and warrant that you are not located in a country subject to a U.S. government embargo or listed on any U.S. government list of prohibited or restricted parties.
                </li>
                <li>
                  You acknowledge and agree that Apple and Apple&apos;s subsidiaries are third-party beneficiaries of these Legal Terms, and upon your acceptance of these Legal Terms, Apple will have the right (and will be deemed to have accepted the right) to enforce them against you as a third-party beneficiary.
                </li>
              </ol>
            </div>
          </section>

          {/* 7. PRIVACY POLICY */}
          <section id="privacy" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              7. Privacy Policy
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We care about your privacy and handle all audio recognition strictly on your device. Please review our{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#1674d6] underline underline-offset-4 hover:text-[#0f5bb5]"
                >
                  Privacy Policy
                </Link>
                , which explains what account, progress, and technical information is processed and how you can delete your account. By using the Services, you agree to our Privacy Policy.
              </p>
              <p>
                Our cloud services are hosted using infrastructure providers such as Google Cloud, Firebase, and Neon. By using synced features of the App, you consent to the processing of your account and learning progress data on those servers as described in our Privacy Policy.
              </p>
            </div>
          </section>

          {/* 8. TERM AND TERMINATION */}
          <section id="termination" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              8. Term and Termination
            </h2>
            <p className="mt-5">
              These Legal Terms remain in effect while you use the Services. We reserve the right to suspend or terminate your access to the Services if you breach these Legal Terms or misuse the Services. You may stop using the Services or delete your account at any time.
            </p>
          </section>

          {/* 9. MODIFICATIONS AND AVAILABILITY */}
          <section id="modifications" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              9. Modifications and Availability
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We may update, modify, or discontinue features of the Services or update these Legal Terms from time to time by revising the &ldquo;Last Updated&rdquo; date above. Your continued use of the Services after changes are posted constitutes acceptance of the updated Legal Terms.
              </p>
              <p>
                While we strive to keep the Services reliable, we cannot guarantee uninterrupted availability and are not liable for temporary downtime, maintenance, or service interruptions.
              </p>
            </div>
          </section>

          {/* 10. GOVERNING LAW & DISPUTE RESOLUTION */}
          <section id="law" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              10. Governing Law &amp; Dispute Resolution
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                These Legal Terms are governed by and construed in accordance with the laws of Indonesia, without regard to conflict-of-law principles.
              </p>
              <p>
                If a dispute arises, we encourage you to contact us first at{" "}
                <a
                  href="mailto:support@chordisol.com"
                  className="font-medium text-[#1674d6] hover:underline"
                >
                  support@chordisol.com
                </a>{" "}
                so we can try to resolve it informally. Any unresolved dispute shall be subject to the exclusive jurisdiction of the competent courts of Indonesia.
              </p>
            </div>
          </section>

          {/* 11. DISCLAIMER */}
          <section
            id="disclaimer"
            className="scroll-mt-24 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 p-6 sm:p-8 shadow-[0_2px_0_rgba(15,23,42,0.04)]"
          >
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-200/60">
              11. Disclaimer
            </h2>
            <p className="mt-5 text-xs sm:text-sm leading-relaxed sm:leading-6 font-medium text-slate-700">
              THE SERVICES ARE PROVIDED ON AN &ldquo;AS-IS&rdquo; AND &ldquo;AS-AVAILABLE&rdquo; BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT ACOUSTIC CHORD RECOGNITION OR ANY LESSON CONTENT WILL BE ERROR-FREE OR UNINTERRUPTED IN EVERY ACOUSTIC ENVIRONMENT.
            </p>
          </section>

          {/* 12. LIMITATIONS OF LIABILITY */}
          <section
            id="liability"
            className="scroll-mt-24 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 p-6 sm:p-8 shadow-[0_2px_0_rgba(15,23,42,0.04)]"
          >
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-200/60">
              12. Limitations of Liability
            </h2>
            <p className="mt-5 text-xs sm:text-sm leading-relaxed sm:leading-6 font-medium text-slate-700">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL CHORDISOL OR ITS TEAM BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA OR LOST PROFITS, ARISING FROM YOUR USE OF THE SERVICES.
            </p>
          </section>

          {/* 13. INDEMNIFICATION */}
          <section id="indemnification" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              13. Indemnification
            </h2>
            <p className="mt-5">
              You agree to defend, indemnify, and hold Chordisol and its team harmless from any claim, loss, liability, or demand (including reasonable legal fees) arising out of your misuse of the Services, your breach of these Legal Terms, or your violation of any third-party rights or applicable law.
            </p>
          </section>

          {/* 14. MISCELLANEOUS */}
          <section id="misc" className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100">
              14. Miscellaneous
            </h2>
            <p className="mt-5">
              These Legal Terms together with our Privacy Policy constitute the entire agreement between you and Chordisol regarding the Services. If any provision is found unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </section>

          {/* 15. CONTACT US */}
          <section
            id="contact"
            className="scroll-mt-24 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 p-6 sm:p-8 shadow-[0_2px_0_rgba(15,23,42,0.04)]"
          >
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-200/60">
              15. Contact Us
            </h2>
            <p className="mt-5 text-slate-600">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-5 space-y-1.5 text-slate-800">
              <p className="font-display text-base font-bold text-slate-900">
                Chordisol
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@chordisol.com"
                  className="font-semibold text-[#1674d6] underline underline-offset-4 transition-colors hover:text-[#0f5bb5]"
                >
                  support@chordisol.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </article>

      <AppFooter />
    </main>
  );
}
