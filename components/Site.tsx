"use client";

import { useCallback, useEffect, useState } from "react";
import SmoothScroll from "./SmoothScroll";
import Loader from "./Loader";
import Header from "./Header";
import Hero from "./Hero";
import Editions from "./Editions";
import Inside from "./Inside";
import Story from "./Story";
import Press from "./Press";
import Reach from "./Reach";
import Shop from "./Shop";
import Footer from "./Footer";

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Site() {
  const [ready, setReady] = useState(false);
  const onDone = useCallback(() => setTimeout(() => setReady(true), 120), []);
  useReveal();
  return (
    <SmoothScroll>
      <Loader onDone={onDone} />
      <Header />
      <main>
        <Hero ready={ready} />
        <span id="formula-zone" className="sr-only" />
        <Editions />
        <Inside />
        <Story />
        <Press />
        <Reach />
        <Shop />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
