"use client";

import { type KeyboardEvent, type MouseEvent, useLayoutEffect, useRef, useState } from "react";
import { talukById } from "@/lib/data";
import type { MapModel, MapShape } from "@/lib/map-model";

const SELECTED = "#2C5A38";
const HOVER = "#C5D8C2";
const LABEL_IDLE = "#4A5548";
const LABEL_ON = "#F4F7F2";

interface Tip {
  shape: MapShape;
  x: number;
  y: number;
}

export interface DistrictMapProps {
  model: MapModel;
  mode: "home" | "page";
  selected?: string;
  /** A taluk hovered elsewhere (the index list) lights up here too. */
  hovered?: string;
  onHover?: (id: string) => void;
  /** `activate` is true for a click or Enter on a shape: open that taluk. */
  onChoose?: (id: string, activate: boolean) => void;
  className?: string;
  role?: string;
  label?: string;
}

export function DistrictMap({
  model,
  mode,
  selected = "",
  hovered = "",
  onHover,
  onChoose,
  className = "choropleth",
  role,
  label,
}: DistrictMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  // Keep the tooltip inside the canvas once its size for this taluk is known.
  useLayoutEffect(() => {
    const el = tipRef.current;
    const canvas = canvasRef.current;
    if (!tip || !el || !canvas) return;
    const box = canvas.getBoundingClientRect();
    let left = tip.x - box.left + 14;
    let top = tip.y - box.top + 14;
    if (left + el.offsetWidth > box.width - 8) left = tip.x - box.left - el.offsetWidth - 12;
    if (top + el.offsetHeight > box.height - 8) top = tip.y - box.top - el.offsetHeight - 12;
    el.style.left = `${Math.max(8, left)}px`;
    el.style.top = `${Math.max(8, top)}px`;
  }, [tip]);

  const showTip = (shape: MapShape, event: MouseEvent) => setTip({ shape, x: event.clientX, y: event.clientY });

  // The selected taluk paints last so its outline sits on top of its neighbours.
  const shapes = selected
    ? [...model.shapes.filter((s) => s.id !== selected), ...model.shapes.filter((s) => s.id === selected)]
    : model.shapes;
  const tipTaluk = tip ? talukById(tip.shape.id) : undefined;
  // Neighbours paint over each other's edges, so the active taluk's outline is redrawn on top of all of them.
  const ringed = [...new Set([selected, hovered].filter(Boolean))]
    .map((id) => model.shapes.find((s) => s.id === id))
    .filter((s): s is MapShape => Boolean(s));

  return (
    <div className={className} id="district-svg" data-map-mode={mode} role={role} aria-label={label}>
      <div className="map-canvas" ref={canvasRef}>
        <svg
          className="choropleth-svg"
          viewBox={`0 0 ${model.width} ${model.height}`}
          aria-label="Chikkamagaluru district, nine taluks"
        >
          {shapes.map((shape) => {
            const on = shape.id === selected;
            const fill = on ? SELECTED : shape.id === hovered ? HOVER : shape.fill;
            return (
              <g key={shape.id} className={`taluk-g${on ? " is-selected" : ""}`} data-taluk-shape={shape.id}>
                <path
                  d={shape.d}
                  fill={fill}
                  data-fill={shape.fill}
                  tabIndex={0}
                  role="button"
                  aria-pressed={on}
                  aria-label={`${shape.name} taluk, ${shape.placeCount} places`}
                  onClick={() => onChoose?.(shape.id, true)}
                  onMouseEnter={(event: MouseEvent) => {
                    onHover?.(shape.id);
                    showTip(shape, event);
                  }}
                  onMouseMove={(event: MouseEvent) => showTip(shape, event)}
                  onMouseLeave={() => {
                    onHover?.("");
                    setTip(null);
                  }}
                  onKeyDown={(event: KeyboardEvent) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onChoose?.(shape.id, true);
                    }
                  }}
                />
              </g>
            );
          })}
          {ringed.map((shape) => (
            <path
              key={`ring-${shape.id}`}
              className={`taluk-ring${shape.id === selected ? " is-selected" : ""}`}
              d={shape.d}
              aria-hidden="true"
            />
          ))}
          {/* Names go last so no neighbouring shape or outline ever covers one. */}
          {model.shapes.map(
            (shape) =>
              shape.label && (
                <text
                  key={`name-${shape.id}`}
                  className={`taluk-name${shape.id === selected ? " is-selected" : ""}`}
                  x={shape.label.x}
                  y={shape.label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={shape.label.size}
                  fill={shape.id === selected ? LABEL_ON : LABEL_IDLE}
                  aria-hidden="true"
                >
                  {shape.label.lines.map((line, i) => (
                    <tspan key={line} x={shape.label!.x} dy={i === 0 ? 0 : shape.label!.lineH}>
                      {line}
                    </tspan>
                  ))}
                </text>
              )
          )}
        </svg>
        <div className="map-tooltip" data-map-tooltip ref={tipRef} hidden={!tip}>
          {tip && (
            <>
              <p className="map-tip-name">{tip.shape.name}</p>
              <p className="map-tip-kn">{tipTaluk?.kannada || ""}</p>
              <p className="map-tip-meta">
                {tip.shape.placeCount} place{tip.shape.placeCount === 1 ? "" : "s"}, click to open this taluk
              </p>
              <p className="map-tip-blurb">{tipTaluk?.blurb || ""}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
