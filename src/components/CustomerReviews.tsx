import { Star } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui";

/*
 * Home page: customer reviews, under "Partner with us".
 * Quotes are copied word for word from Google reviews. Names are shortened to first name +
 * last initial and profile photos are left out: these are private people quoted from a public
 * review, not featured with their permission.
 * The second quote is trimmed (marked with …): the full review names a prescription medicine
 * and compares its price, which reads as Rx promotion under FDA Philippines advertising rules.
 * No Review / AggregateRating JSON-LD on purpose: Google treats a business's own reviews on its
 * own site as self-serving and won't show stars for them.
 */

const REVIEWS = [
  {
    name: "Mary C.",
    text: "I only have positive things to say about their products and services. The staff is very accommodating, offering outstanding service. Their medications are affordable, and I appreciate the discounts they provide. You can easily buy medicine online with same-day delivery, making it very convenient. I highly recommend them.",
  },
  {
    name: "John Vergel L.",
    text: "Affordable products and excellent service! … The staff took it upon themselves to organize shipping and were very accommodating throughout the process.",
  },
  {
    name: "Diana A.",
    text: "Cindy was very helpful and made sure what I need were provided. She confirmed the availability and gave updates for the delivery. She even called me for faster transaction. Was really happy with the service. Will definitely order again with them",
  },
];

// Set to the Google Business Profile reviews link to make the source clickable.
const GOOGLE_REVIEWS_URL = "";

function Stars() {
  return (
    <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className="h-4 w-4 fill-[#FBBC04] text-[#FBBC04]" />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  return (
    <section aria-labelledby="reviews-heading" className="bg-white">
      {/* short bottom padding: Featured Articles follows directly, also on white */}
      <div className="mx-auto max-w-7xl px-5 pb-4 pt-14 md:px-10 md:pb-6 md:pt-20">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
            <span className="mr-2 text-primary">•</span>
            Customer Reviews
          </p>
          <h2 id="reviews-heading" className="font-display mt-5 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
            What our customers say.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <StaggerItem key={r.name} className="h-full">
              <figure className="flex h-full flex-col rounded-3xl border border-[#e4edf3] bg-white p-6 shadow-[0_14px_34px_-26px_rgba(13,84,120,0.35)] md:p-7">
                <Stars />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">
                  <p>&ldquo;{r.text}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#eef2f7] pt-5">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D9FDA] to-[#61A644] text-sm font-semibold text-white"
                  >
                    {r.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-primary-deep">{r.name}</span>
                    {GOOGLE_REVIEWS_URL ? (
                      <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-ink-soft hover:text-primary">
                        Google review
                      </a>
                    ) : (
                      <span className="text-[13px] text-ink-soft">Google review</span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
