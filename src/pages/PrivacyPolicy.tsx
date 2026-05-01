import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg font-semibold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="prose prose-invert max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              AJS Muslim Companion ("the App") is a Quran reader designed with privacy as a
              core principle. We do not collect, sell, or share personal information.
              The App functions almost entirely on your device.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Information We Do Not Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>No account registration is required.</li>
              <li>We do not collect names, emails, phone numbers, or contacts.</li>
              <li>We do not use third-party advertising or analytics SDKs.</li>
              <li>We do not track your reading habits on any remote server.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Data Stored Locally on Your Device</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              The following data is stored only on your device (via browser
              localStorage and IndexedDB) and is never transmitted to us:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Bookmarks, last-read position, and reading progress</li>
              <li>App preferences (theme, font, reciter, translation choice)</li>
              <li>Downloaded audio recitations for offline use</li>
              <li>Saved prayer-time location settings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              You can clear this data at any time by uninstalling the App or clearing
              your browser/app storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Permissions We Request</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">Location</strong> (optional) — used
                solely on-device to compute prayer times and Qibla direction. Your
                coordinates are never sent to our servers.
              </li>
              <li>
                <strong className="text-foreground">Notifications</strong> (optional) —
                used to schedule local Athan reminders. Notifications are scheduled
                locally on your device.
              </li>
              <li>
                <strong className="text-foreground">Storage</strong> — used to cache
                audio for offline recitation playback.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              The App fetches Quran text, translations, tafsir, and audio recitations
              from public APIs over HTTPS:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Quran.com API (api.quran.com) — Arabic text, translations, tafsir</li>
              <li>EveryAyah and similar CDN providers — audio recitations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              These requests transmit only the resource you are viewing (e.g., the
              surah/ayah number). No personal identifiers are sent. Please review the
              respective providers' privacy policies for details on their server logs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The App is suitable for all ages and does not knowingly collect any
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes
              will be reflected by updating the "Last updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy questions, contact us at{" "}
              <a
                href="mailto:support@light-of-deens.com"
                className="text-primary hover:underline"
              >
                support@light-of-deens.com
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
