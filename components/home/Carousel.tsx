"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/components/ui/motion";

export interface CarouselItem {
  id: string;
  image: string;
  alt: string;
  kicker: string;
  title: string;
  description: string;
  link: string;
}

interface Props {
  items: CarouselItem[];
  baseWidth?: number;
  autoplayDelay?: number;
  onChange?: (index: number) => void;
  label?: string;
}

const DRAG_BUFFER = 12;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;

/** Piecewise-linear map of `value` through `input` → `output`, extrapolating at the ends. */
function interpolate(value: number, input: number[], output: number[]): number {
  const last = input.length - 1;
  let i = 0;
  if (value >= input[last]) i = last - 1;
  else if (value > input[0]) while (i < last - 1 && value > input[i + 1]) i += 1;
  const span = input[i + 1] - input[i];
  const t = span === 0 ? 0 : (value - input[i]) / span;
  return output[i] + (output[i + 1] - output[i]) * t;
}

function measureWidth(host: HTMLElement | null, requested: number): number {
  const available = host?.clientWidth || requested;
  const floor = window.innerWidth < 520 ? 232 : 260;
  return Math.round(Math.max(floor, Math.min(requested, available)));
}

/**
 * React Bits Carousel. Cards turn on the Y axis as they slide; loops through a
 * clone at each end, autoplays with pause on hover, and follows drags and arrows.
 */
export function Carousel({ items, baseWidth: requested = 380, autoplayDelay = 2800, onChange, label = "Popular places" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(requested);
  const [active, setActive] = useState(0);
  const position = useRef(1);
  const goToSlide = useRef<(index: number) => void>(() => {});
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Loop through clones: [last, ...items, first].
  const rendered = items.length ? [items[items.length - 1], ...items, items[0]] : [];

  useEffect(() => {
    const root = rootRef.current;
    const onResize = () => setWidth(measureWidth(root?.parentElement ?? null, requested));
    const raf = requestAnimationFrame(onResize);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [requested]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || !items.length) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".carousel-item"));
    const offset = width + GAP;
    const count = items.length;
    const lastClone = rendered.length - 1;
    let x = -position.current * offset;
    let tween: gsap.core.Tween | null = null;
    let animating = false;
    let jumping = false;
    let hovered = false;
    let dragArmed = false;
    let dragging = false;
    let dragStartX = 0;
    let dragOrigin = 0;
    let lastMoveX = 0;
    let lastMoveT = 0;
    let velocityX = 0;

    const activeIndex = () => (position.current - 1 + count) % count;

    const paint = () => {
      const currentX = Number(gsap.getProperty(track, "x")) || x;
      const reduce = prefersReduced();
      cards.forEach((el, index) => {
        const range = [-(index + 1) * offset, -index * offset, -(index - 1) * offset];
        el.style.transform = `rotateY(${reduce ? 0 : interpolate(currentX, range, [90, 0, -90])}deg)`;
      });
      track.style.perspectiveOrigin = `${position.current * offset + width / 2}px 50%`;
    };

    const emit = () => {
      const i = activeIndex();
      setActive(i);
      onChangeRef.current?.(i);
    };

    const settle = () => {
      animating = false;
      if (jumping) return;
      // Landed on a clone: jump invisibly to the real card it copies.
      if (position.current === lastClone || position.current === 0) {
        jumping = true;
        position.current = position.current === 0 ? count : 1;
        setX(-position.current * offset, true);
        jumping = false;
      }
      emit();
    };

    function setX(next: number, immediate: boolean) {
      x = next;
      tween?.kill();
      animating = false;
      if (immediate || jumping || prefersReduced()) {
        gsap.set(track, { x });
        paint();
        settle();
        return;
      }
      animating = true;
      tween = gsap.to(track, { x, duration: 0.55, ease: "power3.out", onUpdate: paint, onComplete: settle });
    }

    const goTo = (next: number, immediate = false) => {
      position.current = Math.max(0, Math.min(lastClone, next));
      setX(-position.current * offset, immediate);
    };

    const timer = prefersReduced()
      ? 0
      : window.setInterval(() => {
          if (hovered || dragging || animating) return;
          goTo(position.current + 1);
        }, autoplayDelay);

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (animating && !prefersReduced()) return;
      dragArmed = true;
      dragging = false;
      dragStartX = lastMoveX = event.clientX;
      dragOrigin = x;
      lastMoveT = performance.now();
      velocityX = 0;
      root.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragArmed) return;
      const now = performance.now();
      velocityX = ((event.clientX - lastMoveX) / Math.max(now - lastMoveT, 1)) * 1000;
      lastMoveX = event.clientX;
      lastMoveT = now;
      const dx = event.clientX - dragStartX;
      if (Math.abs(dx) > 6) {
        dragging = true;
        event.preventDefault();
      }
      if (!dragging) return;
      x = dragOrigin + dx;
      gsap.set(track, { x });
      paint();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragArmed) return;
      dragArmed = false;
      const dx = event.clientX - dragStartX;
      const direction =
        dx < -DRAG_BUFFER || velocityX < -VELOCITY_THRESHOLD ? 1 : dx > DRAG_BUFFER || velocityX > VELOCITY_THRESHOLD ? -1 : 0;
      dragging = false;
      goTo(position.current + direction);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (dragging && (event.target as HTMLElement).closest(".carousel-item")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(position.current + (event.key === "ArrowRight" ? 1 : -1));
      }
    };

    goToSlide.current = (index) => goTo(index + 1);
    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("keydown", onKey);
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    goTo(position.current, true);

    return () => {
      window.clearInterval(timer);
      tween?.kill();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
    // `rendered` is derived from `items`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, width, autoplayDelay]);

  return (
    <div
      ref={rootRef}
      className="carousel-container"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      style={{ width }}
    >
      <div className="carousel-track" ref={trackRef} style={{ width, gap: GAP }}>
        {rendered.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            className="carousel-item"
            href={item.link}
            data-carousel-index={index}
            aria-label={item.title}
            style={{ width, height: "100%" }}
            draggable={false}
          >
            <span className="carousel-item-media">
              <img src={item.image} alt={item.alt} draggable={false} width={900} height={1200} />
            </span>
            <span className="carousel-item-content">
              <span className="carousel-item-kicker">{item.kicker}</span>
              <span className="carousel-item-title">{item.title}</span>
              <span className="carousel-item-description">{item.description}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="carousel-indicators-container">
        <div className="carousel-indicators" role="tablist" aria-label="Slides">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`carousel-indicator ${index === active ? "active" : "inactive"}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active}
              onClick={() => goToSlide.current(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
