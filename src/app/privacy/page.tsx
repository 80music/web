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
      <article className="mx-auto w-full max-w-200 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#1674d6]"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Chordisol</span>
          </Link>
        </div>

        {/* Page header */}
        <header className="border-b border-slate-100 pb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal &amp; Transparency
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Last Updated: November 19, 2026
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Your privacy matters to us. This Privacy Policy explains how our
            music-learning application (&ldquo;the App&rdquo;) handles your
            information when you use its features.
          </p>
        </header>

        {/* Content sections */}
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-slate-600 sm:text-base">
          {/* 1. Audio Recording and Processing */}
          <section aria-labelledby="section-audio">
            <h2
              id="section-audio"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              1. Audio Recording and Processing
            </h2>
            <p className="mt-3">
              The App uses your device&apos;s microphone to capture musical audio
              for chord recognition and learning activities.
            </p>
            <p className="mt-3 font-medium text-slate-800">
              We are committed to protecting your audio privacy:
            </p>
            <ul className="mt-3 space-y-2.5 rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
              <li className="flex items-start gap-2.5 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  On-device processing:
                </span>
                <span>
                  All audio recording and chord recognition take place directly
                  on your device.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio storage:
                </span>
                <span>
                  Your audio recordings are not stored or retained by the App.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio transmission:
                </span>
                <span>
                  Audio recordings are never uploaded to external servers or
                  transmitted outside your device.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio sharing:
                </span>
                <span>
                  Your audio recordings are never shared, sold, or distributed to
                  third parties.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  Limited purpose:
                </span>
                <span>
                  Audio is used exclusively for chord recognition and the
                  App&apos;s music-learning features.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-slate-600">
              Once the audio has been processed for chord recognition, it is
              discarded.
            </p>
          </section>

          {/* 2. Device Information */}
          <section aria-labelledby="section-device">
            <h2
              id="section-device"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              2. Device Information
            </h2>
            <p className="mt-3">
              The App may collect certain technical information about your
              device, including device specifications and hardware capabilities.
            </p>
            <p className="mt-3 font-medium text-slate-800">
              This information is used exclusively for:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-600">
              <li>Debugging and identifying technical issues.</li>
              <li>
                Understanding device compatibility and capabilities.
              </li>
              <li>
                Improving the App&apos;s performance and functionality across
                different devices.
              </li>
            </ul>
            <p className="mt-3 text-slate-600">
              This information is not used to identify you personally or for
              advertising purposes.
            </p>
          </section>

          {/* 3. Learning History and Progress */}
          <section aria-labelledby="section-progress">
            <h2
              id="section-progress"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              3. Learning History and Progress
            </h2>
            <p className="mt-3">
              The App records certain learning activities and progress
              information to support your learning experience.
            </p>
            <p className="mt-3 font-medium text-slate-800">
              This may include:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-600">
              <li>Completed lessons and learning activities.</li>
              <li>Learning progress and performance.</li>
              <li>Chord recognition exercises and results.</li>
              <li>Other information related to your learning journey.</li>
            </ul>
            <p className="mt-3 font-medium text-slate-800">
              This information is used to:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-600">
              <li>Track your learning progress.</li>
              <li>Assess your current music-learning level.</li>
              <li>
                Adapt or support the learning experience based on your
                performance.
              </li>
            </ul>
            <p className="mt-3 text-slate-600">
              Your learning history is stored locally within the App on your
              device and is not shared with third parties.
            </p>
          </section>

          {/* 4. Microphone Permission */}
          <section aria-labelledby="section-mic">
            <h2
              id="section-mic"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              4. Microphone Permission
            </h2>
            <p className="mt-3">
              The App requires access to your device&apos;s microphone to enable
              its audio recording and chord recognition features.
            </p>
            <p className="mt-3">
              You can manage or revoke microphone permissions at any time
              through your device settings. However, disabling microphone access
              may prevent certain features from functioning.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section aria-labelledby="section-third-party">
            <h2
              id="section-third-party"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              5. Third-Party Services
            </h2>
            <p className="mt-3">
              The App does not use external audio processing services. All audio
              recording and chord recognition are handled directly on your
              device.
            </p>
            <p className="mt-3">
              We do not sell, rent, or share your audio recordings or personal
              learning history with third parties.
            </p>
          </section>

          {/* 6. Data Security */}
          <section aria-labelledby="section-security">
            <h2
              id="section-security"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              6. Data Security
            </h2>
            <p className="mt-3">
              We take reasonable measures to protect the information handled by
              the App. Since learning history and related information are stored
              locally, their security may also depend on your device&apos;s
              security settings and protection.
            </p>
          </section>

          {/* 7. Changes to This Privacy Policy */}
          <section aria-labelledby="section-changes">
            <h2
              id="section-changes"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              7. Changes to This Privacy Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time to reflect
              changes in the App or its practices. Any updates will be published
              within the App or through our designated communication channels.
            </p>
          </section>

          {/* 8. Contact Us */}
          <section
            aria-labelledby="section-contact"
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7"
          >
            <h2
              id="section-contact"
              className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              8. Contact Us
            </h2>
            <p className="mt-3 text-slate-600">
              If you have any questions or concerns about this Privacy Policy or
              how your information is handled, please contact us at:
            </p>
            <p className="mt-3">
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
