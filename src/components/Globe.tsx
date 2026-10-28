"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { networkNodes, type NetworkNode } from "@/lib/data";

const HUB = networkNodes.find((n) => n.hub)!;
const SPOKES = networkNodes.filter((n) => !n.hub);

type Props = {
  selected: NetworkNode | null;
  onSelect: (n: NetworkNode | null) => void;
};

export default function Globe({ selected, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);
  const selectedRef = useRef<NetworkNode | null>(selected);
  selectedRef.current = selected;

  useEffect(() => {
    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo: Topology<{ countries: GeometryCollection }>) => {
        setLand(feature(topo, topo.objects.countries) as FeatureCollection<Geometry>);
      });
  }, []);

  useEffect(() => {
    if (!land || !canvasRef.current || !wrapRef.current) return;

    const landFc = land;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let radius = 0;

    const projection = d3.geoOrthographic().clipAngle(90);
    const path = d3.geoPath(projection, ctx);
    const graticule = d3.geoGraticule10();
    const sphere = { type: "Sphere" } as const;

    // Start centered near the Philippines
    let rotation: [number, number, number] = [-HUB.lon + 18, -8, 0];
    let autoSpin = true;
    let dragging = false;
    let lastPointer: [number, number] | null = null;
    let raf = 0;
    let t0 = performance.now();

    function resize() {
      const rect = wrapRef.current!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) / 2 - 14;
      projection.translate([width / 2, height / 2]).scale(radius);
    }

    const visible = (lon: number, lat: number) =>
      d3.geoDistance([lon, lat], [-rotation[0], -rotation[1]]) < Math.PI / 2 - 0.05;

    function nodeAt(px: number, py: number): NetworkNode | null {
      for (const n of networkNodes) {
        if (!visible(n.lon, n.lat)) continue;
        const p = projection([n.lon, n.lat]);
        if (!p) continue;
        const d = Math.hypot(p[0] - px, p[1] - py);
        if (d < (n.hub ? 16 : 12)) return n;
      }
      return null;
    }

    function draw(now: number) {
      const dt = now - t0;
      t0 = now;
      if (autoSpin && !dragging) {
        rotation = [rotation[0] + dt * 0.006, rotation[1], 0];
      }
      projection.rotate(rotation);

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      // Outer glow halo
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.88, cx, cy, radius * 1.18);
      halo.addColorStop(0, "rgba(29,159,218,0.28)");
      halo.addColorStop(1, "rgba(29,159,218,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Ocean
      const ocean = ctx.createRadialGradient(
        cx - radius * 0.35, cy - radius * 0.4, radius * 0.1,
        cx, cy, radius
      );
      ocean.addColorStop(0, "#0e4a6d");
      ocean.addColorStop(0.55, "#07344f");
      ocean.addColorStop(1, "#041f31");
      ctx.beginPath();
      path(sphere);
      ctx.fillStyle = ocean;
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(94,195,240,0.10)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Land
      ctx.beginPath();
      path(landFc);
      ctx.fillStyle = "rgba(60,170,222,0.30)";
      ctx.fill();
      ctx.strokeStyle = "rgba(140,215,250,0.45)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Arcs hub -> spokes (animated dash)
      const dashShift = (now * 0.02) % 24;
      for (const n of SPOKES) {
        const interp = d3.geoInterpolate([HUB.lon, HUB.lat], [n.lon, n.lat]);
        const isSel = selectedRef.current?.id === n.id;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 50; i++) {
          const pt = interp(i / 50);
          if (!visible(pt[0], pt[1])) { started = false; continue; }
          const p = projection(pt as [number, number]);
          if (!p) { started = false; continue; }
          // lift arc off the surface for a 3D ribbon feel
          const lift = Math.sin((i / 50) * Math.PI) * radius * 0.055;
          const dx = p[0] - cx;
          const dy = p[1] - cy;
          const len = Math.hypot(dx, dy) || 1;
          const lx = p[0] + (dx / len) * lift;
          const ly = p[1] + (dy / len) * lift;
          if (!started) { ctx.moveTo(lx, ly); started = true; }
          else ctx.lineTo(lx, ly);
        }
        ctx.setLineDash([10, 14]);
        ctx.lineDashOffset = -dashShift;
        ctx.strokeStyle = isSel ? "rgba(255,255,255,0.95)" : "rgba(80,200,255,0.65)";
        ctx.lineWidth = isSel ? 2.2 : 1.3;
        ctx.shadowColor = "rgba(29,159,218,0.9)";
        ctx.shadowBlur = isSel ? 10 : 5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // Nodes
      const pulse = (Math.sin(now * 0.004) + 1) / 2;
      for (const n of networkNodes) {
        if (!visible(n.lon, n.lat)) continue;
        const p = projection([n.lon, n.lat]);
        if (!p) continue;
        const isSel = selectedRef.current?.id === n.id;
        const base = n.hub ? 6.5 : 4;

        // pulse ring
        ctx.beginPath();
        ctx.arc(p[0], p[1], base + 4 + pulse * (n.hub ? 10 : 6), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(29,159,218,${0.5 - pulse * 0.4})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // core
        ctx.beginPath();
        ctx.arc(p[0], p[1], isSel ? base + 1.5 : base, 0, Math.PI * 2);
        ctx.fillStyle = n.hub ? "#ffffff" : isSel ? "#ffffff" : "#1D9FDA";
        ctx.shadowColor = "rgba(29,159,218,1)";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // label for hub + selected
        if (n.hub || isSel) {
          ctx.font = "600 11px Inter, system-ui, sans-serif";
          const label = n.country;
          const tw = ctx.measureText(label).width;
          const lx = p[0] + 12;
          const ly = p[1] - 12;
          ctx.fillStyle = "rgba(4,26,40,0.78)";
          ctx.beginPath();
          ctx.roundRect(lx - 6, ly - 12, tw + 12, 18, 9);
          ctx.fill();
          ctx.strokeStyle = "rgba(29,159,218,0.4)";
          ctx.stroke();
          ctx.fillStyle = "#d9f3ff";
          ctx.fillText(label, lx, ly + 1);
        }
      }

      // Atmosphere rim
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(140,220,255,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }

    function pointerPos(e: PointerEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      lastPointer = pointerPos(e);
      canvas.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: PointerEvent) {
      const p = pointerPos(e);
      if (dragging && lastPointer) {
        const k = 75 / radius;
        rotation = [
          rotation[0] + (p[0] - lastPointer[0]) * k,
          Math.max(-75, Math.min(75, rotation[1] - (p[1] - lastPointer[1]) * k)),
          0,
        ];
        lastPointer = p;
      } else {
        canvas.style.cursor = nodeAt(p[0], p[1]) ? "pointer" : "grab";
      }
    }
    function onPointerUp(e: PointerEvent) {
      const p = pointerPos(e);
      if (dragging && lastPointer) {
        const moved = Math.hypot(p[0] - lastPointer[0], p[1] - lastPointer[1]);
        if (moved < 4) {
          const hit = nodeAt(p[0], p[1]);
          onSelect(hit);
          autoSpin = !hit;
        }
      }
      dragging = false;
      lastPointer = null;
    }
    function onEnter() { autoSpin = false; }
    function onLeave() { if (!selectedRef.current) autoSpin = true; dragging = false; }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [land, onSelect]);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full touch-none" style={{ cursor: "grab" }} />
      {!land && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
