"use client";

import { useEffect, useRef } from "react";
import "./globals.css";

const cards = [
  {
    eyebrow: "ABOUT ME",
    title:
      "I’M SAM PATEL, A DATA SCIENTIST WHO LOVES USING DATA TO SOLVE COMPLEX PROBLEMS AND DELIVER CLEAR, IMPACTFUL INSIGHTS.",
    stats: [
      { value: "110+", label: "PROJECTS COMPLETED" },
      { value: "12+", label: "YEARS EXPERIENCE" },
      { value: "95%", label: "MODEL ACCURACY" },
      { value: "20+", label: "INDUSTRIES EXPLORED" },
    ],
  },
  {
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
    eyebrow: "SELECTED WORK",
    title:
      "A COLLECTION OF MACHINE LEARNING, ANALYTICS, AND VISUALIZATION PROJECTS BUILT FOR REAL-WORLD USE.",
    stats: [
      { value: "60+", label: "DASHBOARDS" },
      { value: "32", label: "ML MODELS" },
      { value: "14", label: "DATA PIPELINES" },
      { value: "9", label: "AWARDS WON" },
    ],
  },
];

export default function Home() {
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);

useEffect(() => {
  const scroller = scrollerRef.current;

  if (!scroller) {
    return;
  }

  let frameId = null;

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
      const opacity = 1 - absoluteProgress * 0.2;

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

      card.style.setProperty(
        "--card-opacity",
        `${opacity}`,
      );
    });
  };

  const requestUpdate = () => {
    if (frameId !== null) {
      return;
    }

    frameId = window.requestAnimationFrame(updateCards);
  };

  scroller.addEventListener("scroll", requestUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestUpdate);

  updateCards();

  return () => {
    scroller.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);

    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }
  };
}, []);

  return (
    <main className="page-shell">
      <header className="top-bar">
        <button className="circle-button" type="button" aria-label="Profile">
          SP
        </button>

        <button className="circle-button" type="button" aria-label="Contact">
          ✉
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
        {cards.map((card, index) => (
          <article
            key={card.eyebrow}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className="info-card"
          >
            <div className="card-copy">
              <p className="card-eyebrow">{card.eyebrow}</p>
              <h1>{card.title}</h1>
            </div>

            <div className="stats-grid">
              {card.stats.map((stat) => (
                <div className="stat" key={stat.label}>
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
          </article>
        ))}
      </section>

      <footer className="footer">
        <span>&copy; 2025. All rights reserved. DEMË</span>

        <div>
          <span>LICENSES</span>
          <span>POWERED BY NEXT.JS</span>
        </div>
      </footer>
    </main>
  );
}