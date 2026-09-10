"use client";

import { useEffect, useRef } from "react";
import "./globals.css";
import CardHead from "./components/CardHead";

const cards = [
  {
    eyebrow: "ABOUT ME",
    cardNo: "01/04",
    productTitle: "MATTE FINISH.\nSTRONG HOLD.",
    productBody:
      "A plant-based styling clay crafted for effortless texture, lasting hold and a natural matte finish.",
    productImage: "/deme-tub.png",
    productFacts: ["2.8oz / 80ml", "Plant Base", "Made in Malaysia"],
    title:
      "I'M SAM PATEL, A DATA SCIENTIST WHO LOVES USING DATA TO SOLVE COMPLEX PROBLEMS AND DELIVER CLEAR, IMPACTFUL INSIGHTS.",
    stats: [
      { value: "110+", label: "PROJECTS COMPLETED" },
      { value: "12+", label: "YEARS EXPERIENCE" },
      { value: "95%", label: "MODEL ACCURACY" },
      { value: "20+", label: "INDUSTRIES EXPLORED" },
    ],
  },
  {
    cardNo: "02/04",
    eyebrow: "EXPERIENCE",
    title:
      "I TURN COMPLEX DATA INTO SIMPLE, USEFUL PRODUCTS THAT HELP PEOPLE MAKE BETTER DECISIONS.",
    stats: [
      { value: "40+", label: "CLIENTS SUPPORTED" },
      { value: "18", label: "LIVE PRODUCTS" },
      { value: "8", label: "GLOBAL TEAMS" },
      { value: "24/7", label: "DATA MONITORING" },
    ],
  },
  {
    cardNo: "03/04",
    eyebrow: "SELECTED WORK",
    showcaseTitle: "CREAMY TEXTURE.\nEASY TO STYLE.",
    showcaseBody:
      "Smooth and creamy clay that spread easily for effortless control and definition.",
    showcaseImage: "/deme-with-hand.png",
    title:
      "A COLLECTION OF MACHINE LEARNING, ANALYTICS, AND VISUALIZATION PROJECTS BUILT FOR REAL-WORLD USE.",
    stats: [
      { value: "60+", label: "DASHBOARDS" },
      { value: "32", label: "ML MODELS" },
      { value: "14", label: "DATA PIPELINES" },
      { value: "9", label: "AWARDS WON" },
    ],
  },
  {
    cardNo: "04 / 04",
    eyebrow: "STOCKLIST",
    stocklistKicker: "Available Stocklist At:",
    stocklistTitle: "DEE YONDER\nMEN'S HAIR STUDIO",
    stocklistAddress: "95A Club St,\nSingapore 069463",
    stocklistCaption: "PREMIUM GROOMING.\nREAL RESULTS.",
    stocklistSignoff: "See you\nthere.",
    stocklistImage: "/barberchair.png",
  },
];

const featureRows = [
  {
    icon: "/strong-hold.svg",
    title: "STRONG HOLD",
    body: "Keeps your style in place all day long.",
  },
  {
    icon: "/hair.svg",
    title: "MATTE FINISH",
    body: "No shine, just natural texture.",
  },
  {
    icon: "/focus.svg",
    title: "EASY RESTYLE",
    body: "Restyle throughout the day without stiffness.",
  },
  {
    icon: "/wash.svg",
    title: "EASY WASH",
    body: "Rinses out cleanly with shampoo.",
  },
];

export default function Home() {
  const pageRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const page = pageRef.current;
    const scroller = scrollerRef.current;

    if (!page || !scroller) {
      return;
    }

    let frameId: number | null = null;
    let touchStartY = 0;
    let touchStartScrollTop = 0;

    const updateCards = () => {
      frameId = null;

      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerCenter =
        scrollerRect.top + scrollerRect.height / 2;

      cardRefs.current.forEach((card) => {
        if (!card) {
          return;
        }

        const cardRect = card.getBoundingClientRect();
        const cardCenter =
          cardRect.top + cardRect.height / 2;

        const distanceFromCenter =
          cardCenter - scrollerCenter;

        const progress =
          distanceFromCenter / cardRect.height;

        const limitedProgress = Math.max(
          -1.25,
          Math.min(1.25, progress),
        );

        const absoluteProgress = Math.min(
          Math.abs(limitedProgress),
          1,
        );

        const rotation = limitedProgress * -18;
        const scale = 1 - absoluteProgress * 0.08;
        const translateZ = -absoluteProgress * 140;
        const translateY = limitedProgress * 24;

        card.style.setProperty(
          "--rotate-x",
          `${rotation}deg`,
        );

        card.style.setProperty(
          "--card-scale",
          `${scale}`,
        );

        card.style.setProperty(
          "--translate-z",
          `${translateZ}px`,
        );

        card.style.setProperty(
          "--translate-y",
          `${translateY}px`,
        );
      });
    };

    const requestUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateCards);
    };

    const handleWheel = (event: WheelEvent) => {
      /*
      * Prevent the browser/page from trying to scroll.
      * Move the center scroller instead.
      */
      event.preventDefault();

      scroller.scrollTop += event.deltaY;
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      touchStartY = touch.clientY;
      touchStartScrollTop = scroller.scrollTop;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      event.preventDefault();

      const deltaY = touch.clientY - touchStartY;
      scroller.scrollTop = touchStartScrollTop - deltaY;
      requestUpdate();
    };

    page.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    page.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    page.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    scroller.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    updateCards();

    return () => {
      page.removeEventListener("wheel", handleWheel);
      page.removeEventListener("touchstart", handleTouchStart);
      page.removeEventListener("touchmove", handleTouchMove);
      scroller.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <main ref={pageRef} className="page-shell">
      <header className="top-bar">
        <button
          className="circle-button"
          type="button"
          aria-label="Contact"
        >
          <img
            src="/buynow.svg"
            alt=""
            className="buy-now-ring"
          />
          <img
            src="/arrow.svg"
            alt=""
            className="buy-now-arrow"
          />
        </button>
      </header>

      <div className="background-title" aria-hidden="true">
        DEMË
      </div>

      <section
        ref={scrollerRef}
        className="card-scroller"
        aria-label="Portfolio cards"
      >
        {cards.map((card, index) => {
          const isProductCard = index === 0;
          const isFeatureCard = index === 1;
          const isShowcaseCard = index === 2;
          const isStocklistCard = index === 3;

          return (
            <article
              key={card.eyebrow}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className={`info-card ${isProductCard ? "product-card" : ""} ${isFeatureCard ? "feature-card" : ""} ${isShowcaseCard ? "showcase-card" : ""} ${isStocklistCard ? "stocklist-card" : ""}`}
            >
              {isProductCard ? (
                <>
                  <CardHead left="" right={card.cardNo} />

                  <div className="product-body">
                    <h2>
                      {card.productTitle?.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h2>

                    <p>{card.productBody}</p>

                    <img
                      src={card.productImage}
                      alt="Product"
                      className="product-image"
                    />
                  </div>

                  <div className="product-foot">
                    {card.productFacts?.map((fact) => (
                      <span key={fact}>{fact}</span>
                    ))}
                  </div>
                </>
              ) : isFeatureCard ? (
                <>
                  <CardHead left="" right={card.cardNo} />

                  <div className="feature-body">
                    <p className="feature-kicker">WHY DEMË?</p>

                    <h2>
                      <span>STRONG HOLD.</span>
                      <span>NATURAL LOOK.</span>
                    </h2>

                    <ul className="feature-list">
                      {featureRows.map((row) => (
                        <li key={row.title}>
                          <img
                            src={row.icon}
                            alt=""
                            className="feature-icon"
                            aria-hidden="true"
                          />

                          <div className="feature-copy">
                            <strong>{row.title}</strong>
                            <p>{row.body}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="feature-foot">
                    <div className="feature-foot-track" aria-hidden="true">
                      <span>STYLE ✦ RESTYLE ✦ RINSE ✦ REPEAT ✦</span>
                      <span>STYLE ✦ RESTYLE ✦ RINSE ✦ REPEAT ✦</span>
                      <span>STYLE ✦ RESTYLE ✦ RINSE ✦ REPEAT ✦</span>
                    </div>
                  </div>
                </>
              ) : isShowcaseCard ? (
                <>
                  <CardHead left="" right={card.cardNo} />

                  <div className="showcase-body">
                    <h2>
                      {card.showcaseTitle?.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h2>

                    <p>{card.showcaseBody}</p>

                    <img
                      src={card.showcaseImage}
                      alt="Applying DEME clay by hand"
                      className="showcase-image"
                    />
                  </div>
                </>
              ) : isStocklistCard ? (
                <>
                  <CardHead left="" right={card.cardNo} />

                  <div className="stocklist-body">
                    <p className="stocklist-kicker">{card.stocklistKicker}</p>

                    <h2>
                      {card.stocklistTitle?.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h2>

                    <div className="stocklist-address-row">
                      <img
                        src="/map.svg"
                        alt=""
                        className="stocklist-pin"
                        aria-hidden="true"
                      />

                      <p>
                        {card.stocklistAddress?.split("\n").map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                    </div>

                    <p className="stocklist-caption">
                      {card.stocklistCaption?.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>

                    {/* <img
                      src={card.stocklistImage}
                      alt="Barber chair at Dee Yonder Men's Hair Studio"
                      className="stocklist-image"
                    /> */}
                  </div>

                  
                </>
              ) : (
                <>
                  <CardHead left="" right={card.cardNo} />

                  <div className="card-copy">
                    <p className="card-eyebrow">
                      {card.eyebrow}
                    </p>

                    <h1>{card.title}</h1>
                  </div>

                  <div className="stats-grid">
                    {card.stats &&card.stats.map((stat) => (
                      <div
                        className="stat"
                        key={stat.label}
                      >
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="ticker">
                    <span>BACKGROUND ✦</span>
                    <span>BACKGROUND ✦</span>
                    <span>BACKGROUND ✦</span>
                    <span>BACKGROUND ✦</span>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>

      <footer className="footer">
        <span>
          &copy; 2025. All rights reserved. DEMË
        </span>

        <div>
          {/* <span>LICENSES</span>
          <span>POWERED BY NEXT.JS</span> */}
        </div>
      </footer>
    </main>
  );
}