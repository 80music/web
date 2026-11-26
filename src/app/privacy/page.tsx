import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Chordisol",
  description:
    "Learn how Chordisol protects your privacy with 100% on-device audio recognition, zero audio storage, transparent account sync, and no ads or tracking.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Chordisol",
    description:
      "Learn how Chordisol protects your privacy with 100% on-device audio recognition, zero audio storage, transparent account sync, and no ads or tracking.",
    url: "https://chordisol.com/privacy",
    siteName: "Chordisol",
    locale: "en_US",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
            Last Updated: November 26, 2026
          </p>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
            Your privacy matters to us. This Privacy Policy explains how
            Chordisol (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
            handles your information when you use the Chordisol iOS &amp; iPadOS
            application (the &ldquo;App&rdquo;) and our website at{" "}
            <span className="font-medium text-slate-800">chordisol.com</span>.
          </p>
        </header>

        {/* Content sections */}
        <div className="mt-10 sm:mt-12 space-y-10 sm:space-y-12 text-[15px] sm:text-base leading-relaxed sm:leading-7 text-slate-600">
          {/* 1. Audio Recording and On-Device Processing */}
          <section aria-labelledby="section-audio">
            <h2
              id="section-audio"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              1. Audio Recording and On-Device Processing
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                Chordisol uses your device&apos;s microphone to listen to musical
                audio (such as piano, guitar, or hummed notes) for real-time note
                and chord recognition inside guided lessons and practice
                exercises.
              </p>
              <p className="font-semibold text-slate-800">
                We are committed to protecting your audio privacy:
              </p>
            </div>

            <ul className="mt-5 space-y-3.5 rounded-2xl border-2 border-blue-100 bg-linear-to-b from-blue-50/50 to-blue-50/20 p-5 sm:p-7 shadow-[0_2px_0_rgba(22,116,214,0.06)]">
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  100% on-device processing:
                </span>
                <span>
                  All microphone capture, signal filtering, and CoreML chord
                  recognition run locally on your device.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio storage:
                </span>
                <span>
                  Raw audio buffers and recordings are never written to disk or
                  retained by Chordisol.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio transmission:
                </span>
                <span>
                  Audio recordings are never uploaded to external servers or
                  transmitted outside your device. Only structured practice
                  answers (such as recognized note/chord names and timing) are
                  submitted to grade exercises and update your progress.
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <span className="font-semibold text-slate-900 shrink-0">
                  No audio sharing:
                </span>
                <span>
                  Your audio is never shared, sold, or distributed to third
                  parties.
                </span>
              </li>
            </ul>

            <p className="mt-5 text-slate-600">
              Once an audio frame is analyzed for note or chord recognition, it is
              discarded immediately in memory.
            </p>
          </section>

          {/* 2. Account Information & Guest Access */}
          <section aria-labelledby="section-account">
            <h2
              id="section-account"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              2. Account Information &amp; Guest Access
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                You can start using Chordisol immediately as a guest without
                entering an email address or password, or you can create an
                account using Email &amp; Password, Sign in with Apple, or Google
                Sign-In. Guest accounts can optionally be linked to an account
                later so you keep your progress.
              </p>
              <p className="font-semibold text-slate-800">
                Depending on how you sign in, we process:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  An authentication identifier (Firebase UID) — including for
                  anonymous guest sessions so your adaptive practice state works.
                </li>
                <li>
                  Your email address and optional first and last name if you sign
                  up or link with Email, Sign in with Apple, or Google Sign-In.
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Learning Progress & Practice History */}
          <section aria-labelledby="section-progress">
            <h2
              id="section-progress"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              3. Learning Progress &amp; Practice History
            </h2>
            <div className="mt-5 space-y-5">
              <p>
                To power adaptive ear training and let you review past sessions,
                Chordisol stores learning progress on our backend service
                (<span className="font-mono text-sm text-slate-800">bridge.chordisol.com</span>)
                and saves app preferences (such as volume, default input mode, and
                onboarding state) locally on your device.
              </p>
              <div className="space-y-3">
                <p className="font-semibold text-slate-800">
                  Synced learning data includes:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-slate-600">
                  <li>Onboarding skill level and placement test results.</li>
                  <li>Unlocked goals, completed lessons, and practice scores.</li>
                  <li>
                    Exercise attempts (recognized notes/chords, timestamps, and
                    spaced-repetition scheduling data) and session replay history.
                  </li>
                </ul>
              </div>
              <p className="text-slate-600">
                This data is used exclusively to personalize your practice
                curriculum and track your learning journey. It is never sold or
                used for advertising.
              </p>
            </div>
          </section>

          {/* 4. Device Information & Push Notifications */}
          <section aria-labelledby="section-device">
            <h2
              id="section-device"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              4. Device Information &amp; Push Notifications
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                When you register or start a session in the App, Chordisol sends
                limited technical metadata to support compatibility, session
                management, and optional practice reminders:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  App version, platform (<span className="font-mono text-sm">ios</span>),
                  and hardware model identifier (for example, <span className="font-mono text-sm">iPhone16,1</span>).
                </li>
                <li>
                  Device timezone and a Firebase installation identifier.
                </li>
                <li>
                  A push notification token (via Apple Push Notification service
                  and Firebase Cloud Messaging) only if you grant notification
                  permission.
                </li>
              </ul>
              <p className="text-slate-600">
                This technical data is not used for cross-app tracking or
                advertising. You can disable push notifications at any time in iOS
                Settings.
              </p>
            </div>
          </section>

          {/* 5. Device Permissions */}
          <section aria-labelledby="section-mic">
            <h2
              id="section-mic"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              5. Device Permissions
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                <strong className="text-slate-900">Microphone (iOS App):</strong>{" "}
                Required if you choose &ldquo;My Instrument&rdquo; mode to detect
                real acoustic instruments or humming. You can also practice using
                the built-in on-screen virtual piano without microphone access,
                and you can revoke microphone permission anytime in iOS Settings.
              </p>
              <p>
                <strong className="text-slate-900">Notifications (iOS App):</strong>{" "}
                Optional permission used for practice reminders and app updates.
              </p>
              <p>
                <strong className="text-slate-900">
                  Camera (Website Photo Booth only):
                </strong>{" "}
                The iOS App does not request camera access. If you use the
                optional Photo Booth feature on{" "}
                <span className="font-medium text-slate-800">chordisol.com/booth</span>,
                live camera frames are processed in your browser. Photos are only
                uploaded if you choose to generate a QR code to download your
                strip on another device.
              </p>
            </div>
          </section>

          {/* 6. Service Providers & No Ads / No Tracking */}
          <section aria-labelledby="section-third-party">
            <h2
              id="section-third-party"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              6. Service Providers &amp; Zero Advertising
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                Chordisol displays <strong>zero ads</strong>, does not use
                third-party behavioral analytics or ad-tracking SDKs, and never
                sells or rents your personal information.
              </p>
              <p>
                We rely only on essential infrastructure providers to operate the
                App:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-slate-600">
                <li>
                  <strong className="text-slate-900">
                    Google Firebase (Authentication, Installations &amp; Cloud Messaging):
                  </strong>{" "}
                  Manages secure sign-in, guest sessions, and push notification
                  delivery. Firebase Analytics and Ads are disabled.
                </li>
                <li>
                  <strong className="text-slate-900">
                    Sign in with Apple &amp; Google Sign-In:
                  </strong>{" "}
                  Optional identity providers if you choose to sign in with Apple
                  or Google.
                </li>
                <li>
                  <strong className="text-slate-900">
                    Cloud Hosting &amp; Database (Google Cloud &amp; Neon):
                  </strong>{" "}
                  Hosts our practice API and stores your synced learning progress.
                </li>
              </ul>
            </div>
          </section>

          {/* 7. Data Retention & Account Deletion */}
          <section aria-labelledby="section-deletion">
            <h2
              id="section-deletion"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              7. Data Retention &amp; Account Deletion
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We retain your account profile and learning history only for as
                long as your account remains active. You can permanently delete
                your account and all associated server-side progress directly
                inside the App via{" "}
                <strong className="text-slate-900">
                  Settings &rarr; Delete Account
                </strong>
                .
              </p>
              <p>
                You may also request account deletion or data inquiries by
                emailing{" "}
                <a
                  href="mailto:support@chordisol.com"
                  className="font-semibold text-[#1674d6] underline underline-offset-4 hover:text-[#0f5bb5]"
                >
                  support@chordisol.com
                </a>
                . Local preferences stored on your device can be cleared by
                uninstalling the App.
              </p>
            </div>
          </section>

          {/* 8. Data Security & Changes */}
          <section aria-labelledby="section-security">
            <h2
              id="section-security"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pb-3 border-b border-slate-100"
            >
              8. Data Security &amp; Policy Updates
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                We use encrypted HTTPS connections and authenticated Firebase
                tokens to protect data transmitted between the App and our
                servers. Authentication tokens are stored securely in the iOS
                Keychain.
              </p>
              <p>
                We may update this Privacy Policy from time to time to reflect
                improvements to Chordisol or legal requirements. Any updates will
                be posted on this page with an updated &ldquo;Last Updated&rdquo;
                date.
              </p>
            </div>
          </section>

          {/* 9. Contact Us */}
          <section
            aria-labelledby="section-contact"
            className="rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 p-6 sm:p-8 shadow-[0_2px_0_rgba(15,23,42,0.04)]"
          >
            <h2
              id="section-contact"
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
            >
              9. Contact Us
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
