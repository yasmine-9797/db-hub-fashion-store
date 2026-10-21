import { ANNOUNCEMENTS } from "@/config/site";

/** Slim scrolling announcement bar; messages come from config/site.ts. */
export function AnnouncementBar() {
  return (
    <div className="marquee overflow-hidden bg-primary-deep py-2 text-primary-foreground">
      <p className="sr-only">{ANNOUNCEMENTS.join(" • ")}</p>
      {/* Two identical halves; the track slides by -50% so the loop is seamless. */}
      <div aria-hidden="true" className="marquee-track flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((text, i) => (
              <span
                key={i}
                className="eyebrow flex items-center whitespace-nowrap text-[0.6rem] sm:text-[0.68rem]"
              >
                <span className="px-5 text-champagne">✦</span>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
