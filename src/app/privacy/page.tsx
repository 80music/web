import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Chordisol",
  description:
    "Learn how Chordisol protects your audio privacy with on-device chord recognition, zero audio storage, and no external transmission.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Chordisol",
    description:
      "Learn how Chordisol protects your audio privacy with on-device chord recognition, zero audio storage, and no external transmission.",
    url: "https://chordisol.com/privacy",
    siteName: "Chordisol",
    locale: "en_US",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col bg-white">
      <article className="mx-auto w-full max-w-3xl px-4 pt-12 pb-24 sm:px-6 sm:pt-16 sm:pb-32">
        {/* Navigation breadcrumb */}
        <div className="mb-8 sm:mb-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
            <span>Back to Chordisol</span>
          </Link>
        </div>

        {/* Page header */}
        <header className="border-b border-slate-200/80 pb-10 sm:pb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="size-1.5 rounded-full bg-[#1674d6]" />
            <span>Legal &amp; Transparency</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500">
            Last Updated: November 19, 2026
          </p>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600">
            Your privacy matters to us. This Privacy Policy explains how our
            music-learning application (&ldquo;the App&rdquo;) handles your
            information when you use its features.
          </p>
        </header>

        {/* Content sections */}
        <div className="mt-12 sm:mt-16 space-y-16 sm:space-y-20 text-[15px] sm:text-base leading-relaxed sm:leading-7 text-slate-600">
          {/* 1. Audio Recording and Processing */}
          <section aria-labelledby="section-audio">
            <h2
              id="section-audio"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              1. Audio Recording and Processing
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                The App uses your device&apos;s microphone to capture musical audio
                for chord recognition and learning activities.
              </p>
              <p className="font-semibold text-slate-800">
                We are committed to protecting your audio privacy:
              </p>
            </div>

            <ul className="mt-5 space-y-3.5 rounded-2xl border-2 border-blue-100 bg-linear-to-b from-blue-50/50 to-blue-50/20 p-5 sm:p-7 shadow-[0_2px_0_rgba(22,116,214,0.06)]">
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  On-device processing:
                </span>
                <span>
                  All audio recording and chord recognition take place directly
                  on your device.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio storage:
                </span>
                <span>
                  Your audio recordings are not stored or retained by the App.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio transmission:
                </span>
                <span>
                  Audio recordings are never uploaded to external servers or
                  transmitted outside your device.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio sharing:
                </span>
                <span>
                  Your audio recordings are never shared, sold, or distributed to
                  third parties.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  Limited purpose:
                </span>
                <span>
                  Audio is used exclusively for chord recognition and the
                  App&apos;s music-learning features.
                </span>
              </li>
            </ul>

            <p className="mt-5 text-slate-600">
              Once the audio has been processed for chord recognition, it is
              discarded immediately.
            </p>
          </section>

          {/* 2. Device Information */}
          <section aria-labelledby="section-device">
            <h2
              id="section-device"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              2. Device Information
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                The App may collect certain technical information about your
                device, including device specifications and hardware capabilities.
              </p>
              <p className="font-semibold text-slate-800">
                This information is used exclusively for:
              </p>
              <ul className="list-disc space-y-2.5 pl-6 text-slate-600">
                <li>Debugging and identifying technical issues.</li>
                <li>
                  Understanding device compatibility and capabilities.
                </li>
                <li>
                  Improving the App&apos;s performance and functionality across
                  different devices.
                </li>
              </ul>
              <p className="pt-2 text-slate-600">
                This information is not used to identify you personally or for
                advertising purposes.
              </p>
            </div>
          </section>

          {/* 3. Learning History and Progress */}
          <section aria-labelledby="section-progress">
            <h2
              id="section-progress"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              3. Learning History and Progress
            </h2>
            <div className="mt-5 space-y-5">
              <p>
                The App records certain learning activities and progress
                information to support your learning experience.
              </p>
              <div className="space-y-3">
                <p className="font-semibold text-slate-800">
                  This may include:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-slate-600">
                  <li>Completed lessons and learning activities.</li>
                  <li>Learning progress and performance.</li>
                  <li>Chord recognition exercises and results.</li>
                  <li>Other information related to your learning journey.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-slate-800">
                  This information is used to:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-slate-600">
                  <li>Track your learning progress over time.</li>
                  <li>Assess your current music-learning level.</li>
                  <li>
                    Adapt or support the learning experience based on your
                    performance.
                  </li>
                </ul>
              </div>
              <p className="pt-2 text-slate-600">
                Your learning history is stored locally within the App on your
                device and is never shared with third parties.
              </p>
            </div>
          </section>

          {/* 4. Microphone Permission */}
          <section aria-labelledby="section-mic">
            <h2
              id="section-mic"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              4. Microphone Permission
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                The App requires access to your device&apos;s microphone to enable
                its audio recording and chord recognition features.
              </p>
              <p>
                You can manage or revoke microphone permissions at any time
                through your device settings. However, disabling microphone access
                may prevent certain features from functioning.
              </p>
            </div>
          </section>

          {/* 5. Third-Party Services */}
          <section aria-labelledby="section-third-party">
            <h2
              id="section-third-party"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              5. Third-Party Services
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                The App does not use external audio processing services. All audio
                recording and chord recognition are handled directly on your
                device.
              </p>
              <p>
                We do not sell, rent, or share your audio recordings or personal
                learning history with third parties.
              </p>
            </div>
          </section>

          {/* 6. Data Security */}
          <section aria-labelledby="section-security">
            <h2
              id="section-security"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              6. Data Security
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We take reasonable measures to protect the information handled by
                the App. Since learning history and related information are stored
                locally, their security may also depend on your device&apos;s
                security settings and protection.
              </p>
            </div>
          </section>

          {/* 7. Changes to This Privacy Policy */}
          <section aria-labelledby="section-changes">
            <h2
              id="section-changes"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              7. Changes to This Privacy Policy
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in the App or its practices. Any updates will be published
                within the App or through our designated communication channels.
              </p>
            </div>
          </section>

          {/* 8. Contact Us */}
          <section
            aria-labelledby="section-contact"
            className="rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 p-6 sm:p-8 shadow-[0_2px_0_rgba(15,23,42,0.04)]"
          >
            <h2
              id="section-contact"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
            >
              8. Contact Us
            </h2>
            <p className="mt-4 text-slate-600">
              If you have any questions or concerns about this Privacy Policy or
              how your information is handled, please contact us at:
            </p>
            <p className="mt-4">
              <a
                href="mailto:support@chordisol.com"
                className="font-semibold text-[#1674d6] underline underline-offset-4 transition-colors hover:text-[#0f5bb5]"
              >
                support@chordisol.com
              </a>
            </p>
          </section>
        </div>
      </article>

      <AppFooter />
    </main>
  );
}
