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
  mode: "home" | "page" | "taluk";
  selected?: string;
  /** A taluk hovered elsewhere (the index list) lights up here too. */
  hovered?: string;
  onHover?: (id: string) => void;
  /** `activate` is true for a click or Enter on a shape: open that taluk. */
  onChoose?: (id: string, activate: boolean) => void;
  onPlace?: (id: string) => void;
  className?: string;
  role?: string;
  label?: string;
}

export function DistrictMap({
  model,
  mode,
  selected = model.focus,
  hovered = "",
  onHover,
  onChoose,
  onPlace,
  className = "choropleth",
  role,
  label,
}: DistrictMapProps) {
  const interactive = !model.focus;
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

  return (
    <div
      className={className}
      id="district-svg"
      data-map-mode={mode}
      data-focus-taluk={model.focus || undefined}
      role={role}
      aria-label={label}
    >
      <div className="map-canvas" ref={canvasRef}>
        <svg
          className="choropleth-svg"
          viewBox={`0 0 ${model.width} ${model.height}`}
          aria-label={model.focus ? "Places in this taluk" : "Chikkamagaluru district, nine taluks"}
        >
          {shapes.map((shape) => {
            const on = shape.id === selected;
            const fill = on ? SELECTED : interactive && shape.id === hovered ? HOVER : shape.fill;
            const events = interactive
              ? {
                  tabIndex: 0,
                  role: "button",
                  onClick: () => onChoose?.(shape.id, true),
                  onMouseEnter: (event: MouseEvent) => {
                    onHover?.(shape.id);
                    showTip(shape, event);
                  },
                  onMouseMove: (event: MouseEvent) => showTip(shape, event),
                  onMouseLeave: () => {
                    onHover?.("");
                    setTip(null);
                  },
                  onKeyDown: (event: KeyboardEvent) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onChoose?.(shape.id, true);
                    }
                  },
                }
              : { tabIndex: -1 };
            return (
              <g
                key={shape.id}
                className={`taluk-g${shape.focused ? "" : " is-dim"}${on ? " is-selected" : ""}`}
                data-taluk-shape={shape.id}
              >
                <path
                  d={shape.d}
                  fill={fill}
                  data-fill={shape.fill}
                  aria-pressed={on}
                  aria-label={`${shape.name} taluk, ${shape.placeCount} places`}
                  {...events}
                />
                {shape.label && (
                  <text
                    className="taluk-name"
                    x={shape.label.x}
                    y={shape.label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={shape.label.size}
                    fill={on ? LABEL_ON : LABEL_IDLE}
                  >
                    {shape.label.lines.map((line, i) => (
                      <tspan key={line} x={shape.label!.x} dy={i === 0 ? 0 : shape.label!.lineH}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
              </g>
            );
          })}
          {model.pins.map((pin) => (
            <g
              key={pin.id}
              className="place-pin"
              data-place-pin={pin.id}
              onClick={(event) => {
                event.stopPropagation();
                onPlace?.(pin.id);
              }}
            >
              <circle cx={pin.x} cy={pin.y} r="5.2" fill={pin.fill} stroke="#fbfaf5" strokeWidth="1.4" />
              <text x={pin.tx} y={pin.ty} textAnchor={pin.anchor} fontSize="11">
                {pin.name}
              </text>
            </g>
          ))}
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
