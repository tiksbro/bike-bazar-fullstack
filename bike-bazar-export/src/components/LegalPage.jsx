import { SITE } from '../config/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

// Shows one legal page (Terms of Use, Privacy Policy or Listing Rules).
// The words live in src/data/legalContent.js; this file only decides how
// they look. All three pages share it, so a layout fix fixes all three.
//
// Each section can have paragraphs, bullets, or both, so we check for
// each one before drawing it.
function LegalPage({ page }) {
  useDocumentTitle(page.title)

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">{page.title}</h1>
      <p className="text-[13px] text-textfaint mt-1.5">Last updated: {SITE.legalUpdated}</p>
      <p className="text-[15px] leading-relaxed text-textmuted mt-4">{page.intro}</p>

      {/* "On this page" links. Each one jumps to the matching h2 below,
          because the link is #some-id and the heading has id="some-id". */}
      <nav aria-label="On this page" className="border border-bordercol rounded-card bg-sunken p-4 mt-8">
        <p className="text-xs font-semibold text-textfaint">On this page</p>
        <ul className="flex flex-col gap-1.5 mt-2.5">
          {page.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-[14px] text-accent hover:underline break-words">
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-8 mt-8">
        {page.sections.map((section) => (
          <section key={section.id}>
            {/* scroll-mt-24 leaves room for the fixed navbar, so a jump
                link does not hide the heading underneath it. */}
            <h2 id={section.id} className="font-display font-bold text-lg scroll-mt-24">
              {section.heading}
            </h2>

            {section.paragraphs?.map((text) => (
              <p key={text} className="text-[15px] leading-relaxed text-textmuted mt-3">
                {text}
              </p>
            ))}

            {section.bullets && (
              <ul className="flex flex-col gap-2 mt-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 items-start">
                    <span className="text-accent leading-relaxed" aria-hidden="true">•</span>
                    <span className="text-[15px] leading-relaxed text-textmuted">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* break-words so a long email cannot push the page sideways on a phone. */}
      <div className="border border-bordercol rounded-card p-5 mt-10">
        <p className="text-[15px] text-textmuted">
          Questions? Email{' '}
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="text-accent font-semibold hover:underline break-words"
          >
            {SITE.contactEmail}
          </a>
        </p>
      </div>
    </div>
  )
}

export default LegalPage
