"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";

const W = 1000;
const H = 560;
const GROUND = 470;

const INK = "#1b1712";
const ACCENT = "#bf4722";
const PAPER = "#faf8f3";
const MONO = "'IBM Plex Mono', monospace";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const eoCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const eiCubic = (t: number) => Math.pow(clamp01(t), 3);
const eoBack = (t: number) => {
  const c = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
};

function cr(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function BuildingBlock({ x, w, h, tone = "#e9e3d5" }: { x: number; w: number; h: number; tone?: string }) {
  const t = GROUND - h;
  const cols = Math.max(1, Math.floor(w / 52));
  const rows = Math.max(1, Math.floor(h / 58));
  const wins: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      wins.push(
        <rect key={`${r}-${c}`} x={x + 14 + c * ((w - 28) / cols)} y={t + 16 + r * ((h - 30) / rows)} width={(w - 28) / cols - 10} height={(h - 30) / rows - 14} fill="#cdd6da" opacity={0.5} />
      );
    }
  }
  return (
    <g>
      <rect x={x} y={t} width={w} height={h} fill={tone} stroke={INK} strokeOpacity={0.15} strokeWidth={0.8} />
      <rect x={x - 3} y={t} width={w + 6} height={5} fill="#d8d1c1" />
      {wins}
    </g>
  );
}

function StreetBackdrop() {
  return (
    <g>
      <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#d3ccbd" />
      <line x1="0" y1={GROUND} x2={W} y2={GROUND} stroke="#a9a190" strokeWidth={1.5} opacity={0.7} />
      <BuildingBlock x={-30} w={230} h={310} />
      <BuildingBlock x={210} w={185} h={238} tone="#e2dbcb" />
      <BuildingBlock x={405} w={165} h={186} tone="#e9e3d5" />
      <BuildingBlock x={580} w={190} h={262} tone="#e2dbcb" />
      <BuildingBlock x={780} w={240} h={318} />
      <g>
        <rect x={415} y={384} width={145} height={86} fill="#efe9dc" stroke={INK} strokeOpacity={0.25} strokeWidth={0.8} />
        <rect x={415} y={370} width={145} height={14} fill={PAPER} stroke={ACCENT} strokeWidth={0.9} />
        <text x={487} y={381} textAnchor="middle" fontSize={8.5} letterSpacing={1.4} fill={ACCENT} fontFamily={MONO}>
          KHADI &amp; CHAIR CO.
        </text>
        <rect x={423} y={398} width={54} height={40} fill="#cdd6da" stroke={INK} strokeOpacity={0.3} strokeWidth={0.8} />
        <rect x={487} y={398} width={40} height={40} fill="#cdd6da" stroke={INK} strokeOpacity={0.3} strokeWidth={0.8} />
        <rect x={536} y={404} width={18} height={66} fill={INK} opacity={0.72} />
        <rect x={411} y={384} width={153} height={12} fill={ACCENT} opacity={0.88} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={414 + i * 19} y={384} width={9} height={12} fill={PAPER} opacity={0.85} />
        ))}
      </g>
      <g>
        <ellipse cx={420} cy={GROUND - 2} rx={30} ry={6} fill="none" stroke={ACCENT} strokeWidth={1.2} strokeDasharray="5 4" opacity={0.8} />
        <text x={420} y={GROUND + 14} textAnchor="middle" fontSize={7.5} letterSpacing={2} fill={ACCENT} fontFamily={MONO} opacity={0.9}>
          SURVEY PAD
        </text>
      </g>
      {[90, 340, 760, 940].map((x) => (
        <g key={x}>
          <line x1={x} y1={GROUND} x2={x} y2={GROUND - 76} stroke="#3f3b33" strokeWidth={3} />
          <path d={`M${x} ${GROUND - 76} q0 -12 14 -12`} fill="none" stroke="#3f3b33" strokeWidth={3} />
          <circle cx={x + 15} cy={GROUND - 88} r={4} fill={ACCENT} />
        </g>
      ))}
      <Tree2 x={280} />
      <Tree2 x={905} />
      <g stroke="#b9b1a0" strokeWidth={1} opacity={0.5}>
        <line x1="0" y1={GROUND + 34} x2={W} y2={GROUND + 34} />
        <line x1="0" y1={GROUND + 68} x2={W} y2={GROUND + 68} />
      </g>
    </g>
  );
}

function Tree2({ x }: { x: number }) {
  return (
    <g transform={`translate(${x},${GROUND})`}>
      <rect x={-2.5} y={-44} width={5} height={44} fill="#4a4438" />
      <circle cx="0" cy={-58} r={22} fill="#77855f" />
      <circle cx={-9} cy={-66} r={14} fill="#86946c" />
      <circle cx={10} cy={-63} r={12} fill="#86946c" />
    </g>
  );
}

function Drone({ x, y, spin, tilt = 0, s = 1.1 }: { x: number; y: number; spin: boolean; tilt?: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s})`}>
      <line x1="-15" y1="-9" x2="15" y2="9" stroke={INK} strokeWidth={2.4} />
      <line x1="15" y1="-9" x2="-15" y2="9" stroke={INK} strokeWidth={2.4} />
      {[
        [-15, -9],
        [15, -9],
        [-15, 9],
        [15, 9],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={5.5} fill="none" stroke={INK} strokeWidth={1.4} opacity={0.85} />
          {spin ? (
            <ellipse cx={cx} cy={cy} rx={7.5} ry={1.6} fill={INK} opacity={0.5}>
              <animate attributeName="opacity" values="0.55;0.12;0.55" dur="0.16s" repeatCount="indefinite" />
            </ellipse>
          ) : (
            <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={INK} strokeWidth={1.2} opacity={0.6} />
          )}
        </g>
      ))}
      <rect x="-6" y="-5" width="12" height="10" rx="2" fill={INK} />
      <circle cx="0" cy="9" r="3.6" fill={ACCENT} />
      <line x1={-4} y1={5} x2={-6} y2={11} stroke={INK} strokeWidth={1.4} />
      <line x1={4} y1={5} x2={6} y2={11} stroke={INK} strokeWidth={1.4} />
    </g>
  );
}

function Walker({ x, dir, pose, phase }: { x: number; dir: 1 | -1; pose: "walk" | "crouch" | "carry" | "stand"; phase: number }) {
  const moving = pose === "walk" || pose === "carry";
  const step = moving ? Math.sin(phase) : 0;
  const bob = moving ? -Math.abs(Math.cos(phase)) * 2.5 : 0;
  const crouch = pose === "crouch" ? 20 : 0;
  const hipY = -30 + crouch * 0.55 + bob;
  const headY = -63 + crouch + bob;
  const shY = -49 + crouch * 0.8 + bob;
  const f1x = step * 13 * dir;
  const f2x = -step * 13 * dir;
  const l1 = moving ? Math.max(0, Math.sin(phase)) * 7 : 0;
  const l2 = moving ? Math.max(0, -Math.sin(phase)) * 7 : 0;
  const k1x = f1x * 0.45 + dir * 4;
  const k2x = f2x * 0.45 + dir * 4;
  const k1y = (hipY + -l1) / 2 + 2;
  const k2y = (hipY + -l2) / 2 + 2;
  const lean = pose === "crouch" ? dir * 10 : pose === "carry" ? dir * 3 : 0;
  return (
    <g stroke={INK} strokeWidth={5.5} strokeLinecap="round" fill="none" transform={`translate(${x},${GROUND})`}>
      <circle cx={lean * 0.5} cy={headY} r={7.5} fill={INK} stroke="none" />
      <line x1={0} y1={hipY - 18} x2={lean} y2={hipY} />
      <polyline points={`0,${hipY} ${k1x},${k1y} ${f1x},${-l1}`} />
      <polyline points={`0,${hipY} ${k2x},${k2y} ${f2x},${-l2}`} />
      {pose === "carry" ? (
        <>
          <polyline points={`${lean * 0.6},${shY} ${dir * 11},${shY + 15}`} />
          <polyline points={`${lean * 0.6},${shY + 2} ${dir * 13},${shY + 13}`} />
        </>
      ) : pose === "crouch" ? (
        <polyline points={`${lean},${shY} ${dir * 12},${-8}`} />
      ) : (
        <>
          <polyline points={`0,${shY} ${-step * 9 * dir},${shY + 17}`} />
          <polyline points={`0,${shY} ${step * 9 * dir},${shY + 17}`} />
        </>
      )}
    </g>
  );
}

function Caravan({
  x,
  doorOpen,
  driver,
  moving,
  droneDesk,
  operatorReach,
}: {
  x: number;
  doorOpen: boolean;
  driver: boolean;
  moving: boolean;
  droneDesk: boolean;
  operatorReach: number;
}) {
  return (
    <g>
      {doorOpen && (
        <g>
          <polygon points={`${x + 250},398 ${x + 224},386 ${x + 220},446 ${x + 250},446`} fill="#dcd5c7" stroke={INK} strokeOpacity={0.4} strokeWidth={1.2} />
          <rect x={x + 246} y={396} width={8} height={52} fill={INK} opacity={0.55} />
        </g>
      )}
      <path
        d={`M${x} 445 L${x} 340 Q ${x} 332 ${x + 10} 332 L${x + 262} 332 L${x + 272} 346 L${x + 316} 346 L${x + 335} 386 L${x + 339} 445 Z`}
        fill="#d9d2c4"
        stroke={INK}
        strokeOpacity={0.5}
        strokeWidth={1.4}
      />
      <rect x={x} y={424} width={272} height={9} fill={ACCENT} opacity={0.85} />
      <text x={x + 14} y={431} fontSize={6.5} letterSpacing={1.5} fill={PAPER} fontFamily={MONO}>
        EARTHOS LAB · SURVEY 01
      </text>
      <rect x={x + 14} y={356} width={42} height={44} rx={3} fill="#cdd6da" stroke={INK} strokeOpacity={0.4} strokeWidth={1} />
      <line x1={x + 20} y1={392} x2={x + 50} y2={392} stroke={INK} strokeWidth={1.4} opacity={0.5} />
      <line x1={x + 20} y1={384} x2={x + 46} y2={384} stroke={INK} strokeWidth={1.4} opacity={0.5} />
      <circle cx={x + 24} cy={364} r={4.5} fill="#9aa38b" />
      <line x1={x + 24} y1={368} x2={x + 24} y2={372} stroke={INK} strokeWidth={1.4} opacity={0.6} />
      <rect x={x + 86} y={352} width={148} height={66} fill={INK} opacity={0.3} />
      <clipPath id="van-win">
        <rect x={x + 88} y={354} width={144} height={62} rx={3} />
      </clipPath>
      <g clipPath="url(#van-win)">
        <rect x={x + 88} y={354} width={144} height={62} fill="#efe9dc" />
        <line x1={x + 88} y1={370} x2={x + 232} y2={370} stroke={INK} strokeWidth={2} opacity={0.25} />
        <g opacity={0.85}>
          <line x1={x + 96} y1={368} x2={x + 126} y2={368} stroke={INK} strokeWidth={2.5} opacity={0.5} />
          <line x1={x + 97} y1={362} x2={x + 125} y2={362} stroke={INK} strokeWidth={2.5} opacity={0.35} />
          <line x1={x + 98} y1={356} x2={x + 124} y2={356} stroke={INK} strokeWidth={2.5} opacity={0.25} />
        </g>
        <rect x={x + 138} y={402} width={92} height={6} fill="#b9b1a0" />
        <line x1={x + 142} y1={408} x2={x + 142} y2={444} stroke={INK} strokeWidth={2.5} opacity={0.6} />
        <line x1={x + 226} y1={408} x2={x + 226} y2={444} stroke={INK} strokeWidth={2.5} opacity={0.6} />
        <g>
          <rect x={x + 160} y={364} width={44} height={38} rx={2} fill={INK} />
          <rect x={x + 164} y={368} width={36} height={30} fill={PAPER} />
          <rect x={x + 168} y={372} width={20} height={4} fill={ACCENT} />
          <rect x={x + 168} y={380} width={28} height={2.6} fill={INK} opacity={0.5} />
          <rect x={x + 168} y={386} width={24} height={2.6} fill={INK} opacity={0.5} />
          <rect x={x + 178} y={402} width={8} height={6} fill={INK} opacity={0.6} />
          <rect x={x + 164} y={368} width={36} height={30} fill="#fff3df" opacity={0.3}>
            <animate attributeName="opacity" values="0.12;0.35;0.12" dur="2.4s" repeatCount="indefinite" />
          </rect>
        </g>
        <g opacity={0.94}>
          <circle cx={x + 215} cy={364} r={7.5} fill={INK} />
          <path d={`M${x + 206} 372 Q ${x + 215} 379 ${x + 224} 372 L${x + 226} 402 L${x + 204} 402 Z`} fill={INK} />
        </g>
        {operatorReach > 0 && operatorReach < 1 && (
          <g>
            <polyline
              points={`${x + 212},${372} ${x + 196},${382} ${lerp(x + 196, x + 168, operatorReach)},${lerp(382, 396, operatorReach)}`}
              fill="none"
              stroke={INK}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={lerp(x + 196, x + 168, operatorReach)} cy={lerp(382, 396, operatorReach)} r={3} fill={INK} />
          </g>
        )}
        {droneDesk && <Drone x={x + 148} y={397} spin={false} s={0.45} />}
      </g>
      <rect x={x + 88} y={354} width={144} height={62} rx={4} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.6} />
      <rect x={x + 198} y={349} width={42} height={8} rx={2} fill={INK} opacity={0.7} />
      <rect x={x + 246} y={352} width={68} height={40} rx={3} fill="#cdd6da" stroke={INK} strokeOpacity={0.4} strokeWidth={1} />
      <line x1={x + 278} y1={352} x2={x + 278} y2={392} stroke={INK} strokeOpacity={0.45} strokeWidth={1.2} />
      {driver && <circle cx={x + 306} cy={378} r={6} fill={INK} opacity={0.9} />}
      {driver && <path d={`M${x + 315} 397 a 9 9 0 0 0 -15 0`} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.7} />}
      <line x1={x + 244} y1={352} x2={x + 244} y2={444} stroke={INK} strokeOpacity={0.45} strokeWidth={1.2} />
      <rect x={x + 250} y={414} width={5} height={12} rx={2} fill={INK} opacity={0.6} />
      <rect x={x + 330} y={430} width={9} height={7} rx={2} fill="#eed9b0" stroke={INK} strokeOpacity={0.4} strokeWidth={0.8} />
      {moving ? (
        <g>
          {[70, 118, 294].map((wx) => (
            <g key={wx} transform={`translate(${x + wx},454)`}>
              <circle r={16} fill="#2a2620" />
              <circle r={6} fill="#6b665c" />
              <g stroke={PAPER} strokeWidth={1.5} opacity={0.8}>
                <line x1={-10} y1={0} x2={10} y2={0} />
                <line x1={0} y1={-10} x2={0} y2={10} />
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.45s" repeatCount="indefinite" />
              </g>
            </g>
          ))}
        </g>
      ) : (
        <g>
          {[70, 118, 294].map((wx) => (
            <g key={wx} transform={`translate(${x + wx},454)`}>
              <circle r={16} fill="#2a2620" />
              <circle r={6} fill="#6b665c" />
              <line x1={-10} y1={0} x2={10} y2={0} stroke={PAPER} strokeWidth={1.5} opacity={0.6} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function Cursor({ x, y, pressT }: { x: number; y: number; pressT: number }) {
  return (
    <g>
      {pressT < 1 && <circle cx={x} cy={y} r={6 + pressT * 22} fill="none" stroke={ACCENT} strokeWidth={1.6} opacity={1 - pressT} />}
      <path d={`M${x} ${y} l0 16 l4.5 -4.5 l3 7 l4 -1.8 l-3 -6.8 l6 -0.5 z`} fill={INK} stroke={PAPER} strokeWidth={1} />
    </g>
  );
}

function PipelineMontage({ t }: { t: number }) {
  const phase = Math.min(3, Math.floor(t * 4));
  const labels = ["EXPOSURE", "FEATURES", "MESH", "SOLIDS"];
  return (
    <g>
      <rect x={780} y={150} width={122} height={150} fill={PAPER} stroke={INK} strokeOpacity={0.35} strokeWidth={0.9} />
      {phase === 0 && (
        <g>
          <rect x={790} y={162} width={102} height={100} fill="#cdd6da" />
          <rect x={790} y={162} width={51} height={100} fill={INK} opacity={0.22} />
          <text x={806} y={216} fontSize={8} fill={PAPER} fontFamily={MONO}>
            -1EV
          </text>
        </g>
      )}
      {phase === 1 && (
        <g>
          {Array.from({ length: 36 }, (_, i) => (
            <circle key={i} cx={796 + ((i * 37) % 90)} cy={168 + ((i * 53) % 88)} r={1.6} fill={i % 6 === 0 ? ACCENT : INK} opacity={0.7} />
          ))}
        </g>
      )}
      {phase === 2 && (
        <g stroke={INK} strokeWidth={0.6} opacity={0.7} fill="none">
          <rect x={806} y={176} width={60} height={86} />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={806} y1={176 + i * 17} x2={866} y2={176 + i * 17} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <line key={`v${i}`} x1={806 + i * 15} y1={176} x2={806 + i * 15} y2={262} />
          ))}
        </g>
      )}
      {phase === 3 && (
        <g>
          <polygon points="806,176 866,176 886,164 826,164" fill="#cfc7b6" />
          <polygon points="866,176 866,262 886,250 886,164" fill="#b9b1a0" />
          <rect x={806} y={176} width={60} height={86} fill="#eceae1" stroke={INK} strokeOpacity={0.4} strokeWidth={0.8} />
        </g>
      )}
      <text x={841} y={284} textAnchor="middle" fontSize={8} letterSpacing={1} fill={ACCENT} fontFamily={MONO}>
        {labels[phase]}
      </text>
    </g>
  );
}

function MiniMap({ x, y, w, routeT = 1 }: { x: number; y: number; w: number; routeT?: number }) {
  const sc = w / W;
  const blocks: [number, number, number, number][] = [
    [30, 28, 122, 42],
    [58, 88, 92, 40],
    [282, 24, 142, 46],
    [452, 20, 152, 54],
    [722, 26, 118, 48],
    [862, 30, 108, 44],
    [30, 228, 128, 52],
    [42, 298, 108, 56],
    [282, 224, 148, 60],
    [462, 230, 148, 52],
    [300, 310, 118, 44],
    [722, 218, 128, 56],
    [882, 228, 92, 48],
    [712, 300, 148, 56],
    [30, 454, 122, 50],
    [282, 454, 148, 50],
    [462, 460, 140, 46],
    [722, 454, 118, 50],
    [872, 460, 100, 46],
  ];
  const trees: [number, number][] = [
    [188, 140],
    [252, 140],
    [628, 140],
    [708, 140],
    [188, 370],
    [628, 370],
    [708, 370],
    [188, 470],
    [628, 470],
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`}>
      <rect x="0" y="0" width={W} height={H} fill="#f6f1e6" />
      <rect x="0" y="150" width={W} height="50" fill="#d3ccbd" />
      <rect x="0" y="380" width={W} height="50" fill="#d3ccbd" />
      <rect x="200" y="0" width="50" height={H} fill="#d3ccbd" opacity={0.92} />
      <rect x="640" y="0" width="50" height={H} fill="#d3ccbd" opacity={0.92} />
      <g stroke={PAPER} strokeWidth={2.5} strokeDasharray="14 12" opacity={0.85}>
        <line x1="0" y1="175" x2={W} y2="175" />
        <line x1="0" y1="405" x2={W} y2="405" />
        <line x1="225" y1="0" x2="225" y2={H} />
        <line x1="665" y1="0" x2="665" y2={H} />
      </g>
      {blocks.map(([bx, by, bw, bh], i) => (
        <g key={i}>
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={4}
            fill={i === 4 ? "rgba(191,71,34,0.12)" : "#e7e0d2"}
            stroke={i === 4 ? ACCENT : INK}
            strokeOpacity={i === 4 ? 0.55 : 0.18}
            strokeWidth={i === 4 ? 1.6 : 1.1}
          />
          <line x1={bx + 8} y1={by + bh / 2} x2={bx + bw - 8} y2={by + bh / 2} stroke={INK} strokeOpacity={0.14} strokeWidth={1.4} />
          <rect x={bx + bw * 0.6} y={by + bh * 0.22} width={13} height={9} fill={INK} opacity={0.22} />
          <rect x={bx + bw * 0.25} y={by + bh * 0.55} width={9} height={7} fill={INK} opacity={0.18} />
        </g>
      ))}
      {trees.map(([tx, ty], i) => (
        <circle key={i} cx={tx} cy={ty} r={7} fill="#9aa38b" opacity={0.85} />
      ))}
      <path
        d="M225 405 L665 405 L665 175"
        fill="none"
        stroke={ACCENT}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - routeT}
        opacity={routeT > 0 ? 1 : 0}
      />
      <circle cx={225} cy={405} r={11} fill={ACCENT} stroke={PAPER} strokeWidth={3.5} />
      <circle cx={225} cy={405} r={17} fill="none" stroke={ACCENT} strokeWidth={1.5} opacity={0.5}>
        <animate attributeName="r" values="14;24;14" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.55;0.08;0.55" dur="2.2s" repeatCount="indefinite" />
      </circle>
      {routeT > 0.95 && (
        <g transform="translate(665,132)">
          <path d="M0 0 C 17 0 17 28 0 40 C -17 28 -17 0 0 0 Z" fill={ACCENT} />
          <circle cx={0} cy={13} r={4.5} fill={PAPER} />
        </g>
      )}
      <g opacity={0.8}>
        <g transform="translate(938,52)">
          <circle r={13} fill="none" stroke={INK} strokeWidth={1} />
          <path d="M0 -9 L3.6 4 L-3.6 4 Z" fill={ACCENT} />
          <text x={0} y={-17} textAnchor="middle" fontSize={9} fill={INK} fontFamily={MONO}>
            N
          </text>
        </g>
        <g transform="translate(40,530)">
          <line x1={0} y1={0} x2={90} y2={0} stroke={INK} strokeWidth={1.2} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke={INK} strokeWidth={1.2} />
          <line x1={45} y1={-4} x2={45} y2={4} stroke={INK} strokeWidth={1.2} />
          <line x1={90} y1={-4} x2={90} y2={4} stroke={INK} strokeWidth={1.2} />
          <text x={45} y={-7} textAnchor="middle" fontSize={9} fill={INK} fontFamily={MONO}>
            50 M
          </text>
        </g>
        <text x={40} y={44} fontSize={12} letterSpacing={3} fill={INK} opacity={0.45} fontFamily={MONO}>
          SECTOR 17
        </text>
      </g>
    </g>
  );
}

function StreetScene({ s }: { s: number }) {
  const sg = (a: number, b: number) => clamp01((s - a) / (b - a));
  const HOVER_Y = 248;
  const flyT = eoCubic(clamp01(s / 3.6));
  const arrived = clamp01((s - 3.6) / 1.2);
  const hoverX = 600 + Math.sin(s * 0.7) * 230;
  const droneX = s < 3.6 ? lerp(-70, 600, flyT) : s < 13.6 ? hoverX : lerp(600, 452, ss(sg(13.6, 15.2)));
  const flyY = lerp(235, HOVER_Y, clamp01(s / 3.6));
  const droneY = s < 13.6 ? flyY : lerp(HOVER_Y, GROUND - 40, ss(sg(13.6, 15.2)));
  const spin = s < 15.2;
  const droneTilt = s < 3.4 ? -5 : s < 13.6 ? 0 : lerp(0, -4, ss(sg(13.6, 15.2)));
  const scan = clamp01(sg(3.6, 4.6)) * (1 - sg(13.2, 14.2));
  const sweep = Math.sin(s * 2.2);
  const runnerIn = eiCubic(sg(15.4, 17));
  const px1 = lerp(960, 452, runnerIn);
  const carry = ss(sg(18, 19.2));
  const px2 = lerp(452, 610, carry);
  const toCab = ss(sg(20.2, 21.3));
  const px3 = lerp(610, 712, toCab);
  const personX = s < 18 ? px1 : s < 20.2 ? px2 : px3;
  const personVisible = s >= 15.3 && s <= 21.65;
  const personFade = 1 - sg(21.25, 21.65);
  const pose: "walk" | "crouch" | "carry" | "stand" = s < 17 ? "walk" : s < 18 ? "crouch" : s < 19.2 ? "carry" : s < 20.2 ? "stand" : "walk";
  const dir: 1 | -1 = s < 18 ? -1 : 1;
  const reach = sg(19.2, 20.2);
  const dronePass = sg(19.8, 20.4);
  const carX = 460 + 70 * ss(sg(21.5, 24)) + 10 * sg(24, 28);
  const dust = sg(15, 15.8);
  const glass = sg(23.6, 24.6);
  const warm = sg(23.8, 25.4) * 0.14 * (1 - sg(26.4, 27.6));
  const birdX = lerp(90, 950, ss(sg(0.6, 4.2)));
  const birdOut = 1 - sg(4, 4.6);
  const shake = Math.exp(-Math.pow((s - 21.9) * 2.4, 2)) * 4;
  return (
    <g>
      <StreetBackdrop />
      <g transform={`translate(0,${shake})`}>
        {birdOut > 0 && (
          <g transform={`translate(${birdX},${96 + Math.sin(s * 2) * 7})`} opacity={birdOut * 0.55}>
            <path d="M-9 0 Q-4 -7 0 0 Q4 -7 9 0" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-9 0 Q-4 -7 0 0 Q4 -7 9 0;M-9 -3 Q-4 3 0 -2 Q4 3 9 -3;M-9 0 Q-4 -7 0 0 Q4 -7 9 0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}
        {scan > 0 && (
          <g opacity={scan}>
            <polygon
              points={`${droneX},${droneY + 8} ${droneX - 175},${GROUND - 24} ${droneX + 175},${GROUND - 24}`}
              fill={ACCENT}
              fillOpacity={0.1}
            />
            <polygon
              points={`${droneX},${droneY + 8} ${droneX + sweep * 150},${GROUND - 24} ${droneX + sweep * 110},${GROUND - 24}`}
              fill={ACCENT}
              fillOpacity={0.22}
            />
            <line x1={droneX} y1={droneY + 8} x2={droneX + sweep * 160} y2={GROUND - 24} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.8} />
            <ellipse cx={droneX + sweep * 150} cy={GROUND - 22} rx={26} ry={6} fill="none" stroke={ACCENT} strokeWidth={1.2} strokeOpacity={0.8} />
            {[-120, -60, 0, 60, 120].map((dx) => (
              <line key={dx} x1={droneX + dx} y1={GROUND - 26} x2={droneX + dx * 1.4} y2={GROUND - 18} stroke={ACCENT} strokeWidth={0.8} strokeOpacity={0.4} />
            ))}
            <line x1={droneX - 175} y1={GROUND - 22} x2={droneX + 175} y2={GROUND - 22} stroke={ACCENT} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="4 5" />
          </g>
        )}
        {s < 15.2 && <Drone x={droneX} y={droneY} spin={spin} tilt={droneTilt} />}
        {s >= 15.2 && s < 18.0 && <Drone x={452} y={GROUND - 18} spin={false} s={0.75} />}
        {s >= 18.0 && s < 19.8 && <Drone x={personX + dir * 4} y={GROUND - 32} spin={false} s={0.75} />}
        {s >= 19.8 && s < 20.4 && (
          <Drone x={lerp(616, 608, dronePass)} y={lerp(428, 397, dronePass)} spin={false} s={lerp(0.75, 0.5, dronePass)} />
        )}
        {dust > 0 && dust < 1 && (
          <g opacity={1 - dust}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={420 + (i - 1) * 14 + dust * 10} cy={GROUND - dust * 12} r={2.5 + dust * 5} fill="#b9b1a0" />
            ))}
          </g>
        )}
        {personVisible && (
          <g opacity={personFade}>
            <Walker x={personX} dir={dir} pose={pose} phase={personX * 0.055} />
          </g>
        )}
        <Caravan
          x={carX}
          doorOpen={s >= 20.4 && s <= 21.9}
          driver={s >= 21.4}
          moving={s >= 21.5}
          droneDesk={s >= 20.4}
          operatorReach={reach}
        />
        {s >= 21.5 && s <= 23 && (
          <g opacity={1 - sg(21.9, 23)}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={carX - 8 - i * 13 - sg(21.5, 23) * 16} cy={442 - i * 3} r={3 + i * 2.2} fill="#8d8779" opacity={0.5} />
            ))}
          </g>
        )}
        {glass > 0 && (
          <g opacity={glass}>
            <line x1={carX + 92} y1={412} x2={carX + 150} y2={358} stroke={PAPER} strokeWidth={3.5} opacity={0.7} />
            <line x1={carX + 108} y1={414} x2={carX + 162} y2={362} stroke={PAPER} strokeWidth={1.6} opacity={0.6} />
          </g>
        )}
      </g>
      {warm > 0 && <rect x="0" y="0" width={W} height={H} fill="#f2ddb0" opacity={warm} />}
      {s < 16 && (
        <g opacity={1 - sg(15, 16)} transform="translate(40,436)">
          <rect width={104} height={66} fill={INK} rx={4} />
          <rect x={5} y={5} width={94} height={44} fill="#dde5ea" rx={2} />
          <line x1={5} y1={38} x2={99} y2={38} stroke="#a9a190" strokeWidth={1.5} />
          <g transform={`translate(${lerp(12, 92, arrived)},30)`}>
            <circle r={3} fill={ACCENT} />
          </g>
          <text x={7} y={61} fontSize={7} fill={PAPER} fontFamily={MONO} letterSpacing={1}>
            DRONE-CAM · REC
          </text>
          <circle cx={92} cy={57} r={2.5} fill={ACCENT}>
            <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {scan > 0 && (
        <g opacity={scan} fontFamily={MONO} fill={PAPER}>
          <circle cx={40} cy={40} r={6} fill={ACCENT}>
            <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <text x={54} y={44} fontSize={12} letterSpacing={1}>
            REC
          </text>
          <text x={40} y={70} fontSize={10} opacity={0.85}>
            5.7K · 30 FPS · 360°
          </text>
          <text x={W - 40} y={44} fontSize={10} textAnchor="end" opacity={0.85}>
            DRONE 01 · SCANNING
          </text>
          <text x={W / 2} y={44} fontSize={11} textAnchor="middle" letterSpacing={2} opacity={0.9}>
            SCANNING · 360° LIDAR
          </text>
          <path d="M20 20 h18 M20 20 v18 M980 20 h-18 M980 20 v18 M20 540 h18 M20 540 v-18 M980 540 h-18 M980 540 v-18" stroke={PAPER} strokeWidth={1.4} opacity={0.7} fill="none" />
        </g>
      )}
    </g>
  );
}

function LaptopScene({ s }: { s: number }) {
  const q = s - 28;
  const sg = (a: number, b: number) => clamp01((q - a) / (b - a));
  const drag = ss(sg(1.8, 3.4));
  const dragX = lerp(250, 690, drag);
  const dragY = lerp(140, 225, drag) - Math.sin(drag * Math.PI) * 26;
  const prog = sg(4, 6);
  const pop = sg(6, 6.6);
  const popScale = pop <= 0 ? 0.001 : lerp(0.7, 1, eoBack(pop));
  const cursorX = q < 1.8 ? 300 + Math.sin(q * 2) * 8 : q < 3.4 ? dragX - 2 : q < 4.2 ? 835 : q < 6 ? 700 : lerp(700, 745, sg(6, 7));
  const cursorY = q < 1.8 ? 180 : q < 3.4 ? dragY - 4 : q < 4.2 ? 395 : q < 6 ? 352 : lerp(352, 282, sg(6, 7));
  const pressT = q >= 3.4 && q <= 4.4 ? sg(3.5, 4.3) : 1;
  const btnPressed = q >= 3.4 && q <= 4;
  const files = ["RAW_0047.INSV · 4.2 GB", "RAW_0048.INSV · 4.1 GB", "RAW_0049.INSV · 4.3 GB"];
  return (
    <g fontFamily={MONO}>
      <rect x="0" y="0" width={W} height={H} fill="#f4efe3" />
      <rect x="0" y="0" width={W} height={30} fill="#ece5d4" />
      <line x1="0" y1={30} x2={W} y2={30} stroke={INK} strokeOpacity={0.25} />
      <circle cx={18} cy={15} r={4} fill={ACCENT} />
      <circle cx={32} cy={15} r={4} fill="#c9c2b2" />
      <circle cx={46} cy={15} r={4} fill="#c9c2b2" />
      <text x={70} y={19} fontSize={9} letterSpacing={1.5} fill={INK}>
        EARTHOS LAB OS
      </text>
      <text x={W - 20} y={19} fontSize={9} fill={INK} textAnchor="end">
        14:22
      </text>
      <g>
        <rect x={86} y={92} width={340} height={246} fill={INK} opacity={0.08} />
        <rect x={80} y={86} width={340} height={246} fill={PAPER} stroke={INK} strokeOpacity={0.4} strokeWidth={1} rx={4} />
        <rect x={80} y={86} width={340} height={26} fill="#eae3d3" rx={4} />
        <text x={94} y={103} fontSize={9} letterSpacing={1} fill={INK}>
          DRONE_01 — 3 FILES
        </text>
        {files.map((f, i) => (
          <g key={f}>
            <rect x={92} y={124 + i * 34} width={316} height={28} fill={i === 0 && q >= 1.6 ? "rgba(191,71,34,0.1)" : "transparent"} stroke={i === 0 && q >= 1.6 ? ACCENT : INK} strokeOpacity={i === 0 && q >= 1.6 ? 0.9 : 0.2} strokeWidth={0.9} rx={3} />
            <text x={102} y={142 + i * 34} fontSize={9.5} fill={i === 0 ? ACCENT : INK}>
              {f}
            </text>
          </g>
        ))}
      </g>
      <g>
        <rect x={466} y={116} width={460} height={320} fill={INK} opacity={0.08} />
        <rect x={460} y={110} width={460} height={320} fill={PAPER} stroke={INK} strokeOpacity={0.4} strokeWidth={1} rx={4} />
        <rect x={460} y={110} width={460} height={26} fill="#eae3d3" rx={4} />
        <text x={474} y={127} fontSize={9} letterSpacing={1} fill={INK}>
          EARTHOS LAB PIPELINE
        </text>
        <rect x={478} y={148} width={284} height={152} fill="none" stroke={ACCENT} strokeWidth={1.1} strokeDasharray="6 5" rx={4} />
        {prog <= 0 && (
          <text x={620} y={228} textAnchor="middle" fontSize={10} letterSpacing={1} fill="#8d8779">
            DROP RAW FOOTAGE HERE
          </text>
        )}
        {prog > 0 && (
          <g>
            <rect x={490} y={158} width={260} height={8} fill="#e0d9c8" />
            <rect x={490} y={158} width={260 * prog} height={8} fill={ACCENT} />
            <rect x={490} y={158} width={14} height={8} fill={PAPER} opacity={0.5}>
              <animate attributeName="x" values="490;736;490" dur="1.4s" repeatCount="indefinite" />
            </rect>
            <text x={490} y={186} fontSize={9} fill={INK}>
              {prog < 1 ? `SOLVING… ${Math.round(prog * 100)}%` : "SOLVE COMPLETE"}
            </text>
          </g>
        )}
        <PipelineMontage t={prog} />
        <rect x={780} y={382} width={112} height={30} rx={4} fill={btnPressed ? "#9c3a1c" : ACCENT} transform={btnPressed ? "translate(0,2)" : undefined} />
        <text x={836} y={401} textAnchor="middle" fontSize={10} letterSpacing={1.5} fill={PAPER}>
          UPLOAD
        </text>
      </g>
      {drag > 0 && drag < 1 && (
        <g>
          {[0.12, 0.24, 0.36].map((o, i) => (
            <rect key={i} x={dragX - i * 14} y={dragY + i * 5} width={90} height={22} rx={3} fill={PAPER} stroke={ACCENT} strokeWidth={0.9} opacity={1 - o * 2} />
          ))}
          <rect x={dragX} y={dragY} width={90} height={22} rx={3} fill={PAPER} stroke={ACCENT} strokeWidth={1.2} />
          <text x={dragX + 45} y={dragY + 14.5} textAnchor="middle" fontSize={8} fill={ACCENT}>
            RAW_0047.INSV
          </text>
        </g>
      )}
      {q >= 4 && q <= 5.2 && (
        <g>
          {[0, 1, 2, 3].map((i) => {
            const t = (q - 4 + i * 0.25) % 1.2;
            const cx2 = lerp(250, 620, t);
            const cy2 = lerp(140, 200, t) - Math.sin(t * Math.PI) * 30;
            return <rect key={i} x={cx2} y={cy2} width={12} height={9} rx={1.5} fill={ACCENT} opacity={0.75} transform={`rotate(${t * 90} ${cx2} ${cy2})`} />;
          })}
        </g>
      )}
      {pop > 0 && (
        <g transform={`translate(740 280) scale(${popScale}) translate(-740 -280)`}>
          <rect x={548} y={128} width={400} height={324} fill={INK} opacity={0.12} />
          <rect x={540} y={120} width={400} height={324} fill={PAPER} stroke={INK} strokeWidth={1.6} rx={8} />
          <rect x={540} y={120} width={400} height={28} fill="#eae3d3" rx={8} />
          <circle cx={556} cy={134} r={4} fill={ACCENT} />
          <text x={570} y={138} fontSize={9.5} letterSpacing={1} fill={INK}>
            SECTOR 17 · 3D MAP
          </text>
          <MiniMap x={556} y={158} w={368} />
        </g>
      )}
      {q < 9.2 && <Cursor x={cursorX} y={cursorY} pressT={pressT} />}
    </g>
  );
}

function MapAppScene({ s }: { s: number }) {
  const q = s - 37;
  const sg = (a: number, b: number) => clamp01((q - a) / (b - a));
  const txtA = "SECTOR 17 MARKET".slice(0, Math.round(sg(0, 1) * 16));
  const txtB = "KHADI & CHAIR CO.".slice(0, Math.round(sg(1, 2) * 17));
  const draw = sg(3, 4.4);
  const btnPressed = q >= 2.4 && q <= 3;
  const cursorX = q < 1 ? 240 + txtA.length * 6 : q < 2 ? 640 + txtB.length * 6 : q < 3 ? lerp(700, 180, ss(sg(2, 2.5))) : lerp(180, 500, sg(3.2, 4));
  const cursorY = q < 1 ? 448 : q < 2 ? 448 : q < 3 ? lerp(448, 510, ss(sg(2, 2.5))) : lerp(510, 300, sg(3.2, 4));
  const pressT = q >= 2.4 && q <= 3.4 ? sg(2.5, 3.3) : 1;
  return (
    <g fontFamily={MONO}>
      <rect x="0" y="0" width={W} height={H} fill="#f6f1e6" />
      <rect x="0" y="0" width={W} height={40} fill="#ece5d4" />
      <circle cx={20} cy={20} r={4.5} fill={ACCENT} />
      <circle cx={35} cy={20} r={4.5} fill="#c9c2b2" />
      <text x={56} y={24.5} fontSize={10} letterSpacing={1.5} fill={INK}>
        SECTOR 17 · 3D MAP — ROUTE PLANNER
      </text>
      <g>
        <rect x={186} y={54} width={632} height={348} fill={PAPER} stroke={INK} strokeOpacity={0.4} strokeWidth={1.2} rx={4} />
        <g transform="translate(192,60)">
          <MiniMap x={0} y={0} w={620} routeT={draw} />
        </g>
      </g>
      <g>
        <rect x={56} y={420} width={404} height={46} rx={4} fill={PAPER} stroke={INK} strokeOpacity={0.45} strokeWidth={1.1} />
        <text x={70} y={438} fontSize={8} letterSpacing={1} fill={ACCENT}>
          A · PICKUP
        </text>
        <text x={70} y={456} fontSize={11} fill={INK}>
          {txtA}
          {q < 1 && (
            <tspan>
              <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
              |
            </tspan>
          )}
        </text>
        <rect x={480} y={420} width={404} height={46} rx={4} fill={PAPER} stroke={INK} strokeOpacity={0.45} strokeWidth={1.1} />
        <text x={494} y={438} fontSize={8} letterSpacing={1} fill={ACCENT}>
          B · DESTINATION
        </text>
        <text x={494} y={456} fontSize={11} fill={INK}>
          {txtB}
          {q >= 1 && q < 2 && (
            <tspan>
              <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
              |
            </tspan>
          )}
        </text>
        <rect x={56} y={482} width={250} height={52} rx={5} fill={btnPressed ? "#9c3a1c" : ACCENT} transform={btnPressed ? "translate(0,2)" : undefined} />
        <text x={181} y={513} textAnchor="middle" fontSize={11.5} letterSpacing={2} fill={PAPER}>
          ROUTE PREVIEW
        </text>
        <text x={330} y={512} fontSize={8.5} fill="#8d8779">
          240 M · 3 MIN · WALK
        </text>
      </g>
      {q < 4.8 && <Cursor x={cursorX} y={cursorY} pressT={pressT} />}
    </g>
  );
}

function PovContent({ q }: { q: number }) {
  const vpY = 245;
  // Natural human footstep gait bobbing & shoulder sway
  const walkBob = Math.abs(Math.sin(q * Math.PI * 2.8)) * 5.5;
  const shoulderRoll = Math.sin(q * Math.PI * 1.4) * 0.8;
  const push = 1 + q * 0.04;

  // Perspective animated elements moving past the walker
  const stepPhase = (q * 0.35) % 1;
  const treeP = [0.15, 0.45, 0.75].map((off) => (off + stepPhase) % 1);

  return (
    <g transform={`translate(${shoulderRoll},${walkBob})`}>
      <g transform={`translate(${500 - 500 * push} ${380 - 380 * push}) scale(${push})`}>
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dbe4e9" />
            <stop offset="70%" stopColor="#f2eae0" />
            <stop offset="100%" stopColor="#f8f4ec" />
          </linearGradient>
          <linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Sky & Sun */}
        <rect x="0" y="0" width={W} height={vpY + 20} fill="url(#sky-grad)" />
        <circle cx="850" cy="72" r="28" fill="#fff3df" opacity={0.9} />

        {/* --- 1. THE VEHICLE ROAD (Left side of screen) --- */}
        <polygon points={`0,120 0,560 380,560 470,${vpY}`} fill="#dcd5c7" />
        {/* Road center dash lines */}
        <line x1={180} y1={560} x2={435} y2={vpY} stroke={PAPER} strokeWidth={3} strokeDasharray="14 12" opacity={0.7} />

        {/* --- 2. THE CURB & CURBSTONES --- */}
        <polygon points={`380,560 410,560 476,${vpY} 470,${vpY}`} fill="#9c9587" />
        {[0.15, 0.35, 0.55, 0.75, 0.95].map((t, i) => (
          <line
            key={i}
            x1={lerp(380, 470, t)}
            y1={lerp(560, vpY, t)}
            x2={lerp(410, 476, t)}
            y2={lerp(560, vpY, t)}
            stroke="#6e685c"
            strokeWidth={1.2}
          />
        ))}

        {/* --- 3. THE PEDESTRIAN SIDEWALK / FOOTPATH (Right side) --- */}
        <polygon points={`410,560 ${W},560 ${W},120 476,${vpY}`} fill="#eae3d3" />

        {/* Sidewalk Paving Slabs & Tile Lines */}
        {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
          <line
            key={`h-tile-${i}`}
            x1={lerp(410, 476, t)}
            y1={lerp(560, vpY, t)}
            x2={W}
            y2={lerp(560, 120, t)}
            stroke="#c9c1af"
            strokeWidth={lerp(1.8, 0.6, t)}
          />
        ))}

        {/* --- 4. SECTOR 17 STOREFRONT BUILDINGS (Right Sidewalk Edge) --- */}
        {/* Background Building Block */}
        <rect x="740" y="100" width="260" height="150" fill="#d9d2c2" stroke={INK} strokeOpacity={0.25} />

        {/* Target Storefront: KHADI & CHAIR CO. */}
        <g transform="translate(560, 108)">
          {/* Main Store Structure */}
          <rect x="0" y="40" width="280" height="130" fill="#ded7c7" stroke={INK} strokeWidth={1.4} />
          
          {/* Decorative Striped Awning */}
          <polygon points="-10,40 290,40 300,56 -20,56" fill={ACCENT} />
          {[-10, 30, 70, 110, 150, 190, 230, 270].map((ax, i) => (
            <polygon key={`awn-${i}`} points={`${ax},40 ${ax + 20},40 ${ax + 22},56 ${ax + 2},56`} fill={PAPER} opacity={0.9} />
          ))}

          {/* Store Name Signboard */}
          <rect x="20" y="6" width="240" height="30" fill={PAPER} stroke={ACCENT} strokeWidth={1.8} rx={3} />
          <text x="140" y="26" textAnchor="middle" fontSize={12} letterSpacing={2.5} fill={ACCENT} fontFamily={MONO} fontWeight="bold">
            KHADI &amp; CHAIR CO.
          </text>

          {/* Glass Display Windows with Furniture Silhouettes */}
          <rect x="24" y="66" width="100" height="88" fill="#e3ded2" stroke={INK} strokeWidth={1.2} />
          <rect x="24" y="66" width="100" height="88" fill="url(#glass-glare)" />
          {/* Chair Silhouette inside Display */}
          <rect x="54" y="112" width="24" height="26" fill="#8d8779" opacity={0.6} />
          <line x1="54" y1="124" x2="78" y2="124" stroke="#8d8779" strokeWidth={2} opacity={0.6} />

          {/* Entrance Doorway */}
          <rect x="144" y="66" width="60" height="104" fill="#57524a" />
          <rect x={148} y={70} width={24} height={96} fill="#e2ded4" opacity={0.3} />
          <rect x={176} y={70} width={24} height={96} fill="#e2ded4" opacity={0.3} />
          <circle cx={172} cy={122} r={3} fill="#eed9b0" />

          {/* Outdoor Planter Boxes */}
          <rect x="14" y="146" width="34" height="18" fill="#8d8779" rx={2} />
          <circle cx={31} cy={140} r={10} fill="#7c8c6e" />
        </g>

        {/* --- 5. LUSH TREES PERMANENTLY ANCHORED TO GROUND ALONG SIDEWALK CURB --- */}
        {[
          { x: 422, y: 540, s: 1.15 },
          { x: 442, y: 420, s: 0.82 },
          { x: 456, y: 320, s: 0.58 },
          { x: 468, y: 258, s: 0.42 },
        ].map((tr, i) => (
          <g key={`tree-${i}`} transform={`translate(${tr.x},${tr.y}) scale(${tr.s})`}>
            {/* Trunk */}
            <rect x="-4" y="-45" width="8" height="45" fill="#524b40" />
            {/* Foliage Layers */}
            <circle cx="0" cy="-65" r="28" fill="#7c8c6e" />
            <circle cx="-12" cy="-55" r="22" fill="#69785c" />
            <circle cx="12" cy="-55" r="22" fill="#8a9a7a" />
          </g>
        ))}

        {/* Cast-Iron Streetlamp on Sidewalk */}
        <g transform="translate(530, 290) scale(0.6)">
          <line x1={0} y1={0} x2={0} y2={-120} stroke="#3f3b33" strokeWidth={4} />
          <path d="M0 -120 Q-12 -135 -24 -135" fill="none" stroke="#3f3b33" strokeWidth={3} />
          <circle cx="-24" cy="-135" r={7} fill="#fff3df" />
          <circle cx="-24" cy="-135" r={14} fill="#fff3df" opacity={0.35} />
        </g>

        {/* Sidewalk Bench */}
        <g transform="translate(620, 360) scale(0.7)">
          <rect x="0" y="0" width="56" height="6" fill="#8d8779" />
          <rect x="0" y="8" width="56" height="6" fill="#8d8779" />
          <line x1="8" y1="14" x2="8" y2="28" stroke="#3f3b33" strokeWidth={3} />
          <line x1="48" y1="14" x2="48" y2="28" stroke="#3f3b33" strokeWidth={3} />
        </g>

        {/* --- 6. PEDESTRIAN ROUTE LINE ON THE SIDEWALK (FOOTPATH) --- */}
        <g>
          <path
            d="M 680 560 L 630 420 L 595 270"
            fill="none"
            stroke={ACCENT}
            strokeWidth={4.5}
            strokeDasharray="10 9"
            strokeLinecap="round"
            opacity={0.95}
          >
            <animate attributeName="stroke-dashoffset" values="0;-19" dur="0.6s" repeatCount="indefinite" />
          </path>

          {/* Directional Waypoint Markers on Sidewalk */}
          {[0.2, 0.5, 0.8].map((t, i) => {
            const wx = lerp(680, 595, t);
            const wy = lerp(560, 270, t);
            const sz = lerp(16, 6, t);
            return (
              <path
                key={`wp-${i}`}
                d={`M${wx - sz} ${wy + sz} L${wx} ${wy - sz * 0.3} L${wx + sz} ${wy + sz}`}
                fill="none"
                stroke={ACCENT}
                strokeWidth={lerp(3.2, 1.4, t)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      </g>
    </g>
  );
}

function ExitSequence({ s }: { s: number }) {
  const q = s - 45;
  const sg = (a: number, b: number) => clamp01((q - a) / (b - a));
  const rise = eoCubic(sg(0, 1.6));
  const tap = sg(2.1, 2.5);
  const drift = ss(sg(2.2, 3.8));
  const walking = q >= 1.5;

  return (
    <g>
      <g transform={`translate(${-drift * 20} 0)`}>
        <PovContent q={q + 2} />
      </g>
      <rect x="0" y="0" width={W} height={H} fill="#f2ddb0" opacity={0.06} />

      {/* Human Hand & Smartphone Display (First-Person Pedestrian View) */}
      <g transform={`translate(0, ${(1 - rise) * 120})`}>
        {/* Arm & Hand holding phone */}
        <path d="M620 560 Q 610 500 570 480" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" opacity={0.9} />
        <circle cx={568} cy={476} r={12} fill={INK} />

        {/* Smartphone Frame */}
        <g transform="translate(440, 330)">
          <rect x="0" y="0" width={120} height={200} rx={16} fill={INK} />
          <clipPath id="phone-display">
            <rect x={6} y={8} width={108} height={184} rx={12} />
          </clipPath>
          <g clipPath="url(#phone-display)">
            <rect x={6} y={8} width={108} height={184} fill={PAPER} />
            <rect x={6} y={8} width={108} height={26} fill="#eae3d3" />
            <text x={60} y={24} textAnchor="middle" fontSize={7.5} letterSpacing={1.2} fill={ACCENT} fontFamily={MONO} fontWeight="bold">
              {walking ? "NAVIGATING" : "ARRIVED"}
            </text>

            {!walking ? (
              <>
                <MiniMap x={6} y={34} w={108} routeT={1} />
                <rect x={6} y={130} width={108} height={62} fill={PAPER} />
                <text x={14} y={148} fontSize={8} fill={INK} fontFamily={MONO} fontWeight="bold">
                  KHADI &amp; CHAIR CO.
                </text>
                <text x={14} y={160} fontSize={6.5} fill="#8d8779" fontFamily={MONO}>
                  STEP INSIDE · DOORSTEP
                </text>
                <rect x={14} y={168} width={92} height={18} rx={9} fill={ACCENT} />
                <text x={60} y={180} textAnchor="middle" fontSize={6.5} letterSpacing={1} fill={PAPER} fontFamily={MONO}>
                  YOU HAVE ARRIVED
                </text>
              </>
            ) : (
              <>
                <rect x={6} y={34} width={108} height={158} fill={PAPER} />
                {[0, 1, 2].map((i) => {
                  const cy2 = 130 - ((q * 24 + i * 20) % 60);
                  const sz = 14 - i * 3;
                  return (
                    <path
                      key={i}
                      d={`M${60 - sz} ${cy2 + sz} L${60} ${cy2 - sz * 0.2} L${60 + sz} ${cy2 + sz}`}
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth={3 - i * 0.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
                <text x={60} y={162} textAnchor="middle" fontSize={12} fill={INK} fontFamily={MONO} fontWeight="bold">
                  15 M
                </text>
                <text x={60} y={174} textAnchor="middle" fontSize={6.5} fill="#8d8779" fontFamily={MONO}>
                  KHADI &amp; CHAIR CO.
                </text>
              </>
            )}
          </g>
          <rect x={36} y={2} width={48} height={5} rx={2.5} fill={INK} />
        </g>
      </g>
      {q >= 3.3 && (
        <g opacity={ss(sg(3.4, 4))} fontFamily={MONO}>
          <rect x={330} y={512} width={340} height={30} fill={PAPER} stroke={ACCENT} strokeWidth={1} opacity={0.95} />
          <text x={500} y={532} textAnchor="middle" fontSize={10.5} letterSpacing={3} fill={ACCENT}>
            EARTHOS LAB — FIND YOUR WAY
          </text>
        </g>
      )}
    </g>
  );
}

type Cam = { f: [number, number]; k: number };
type Frame = { label: string; cam: Cam; dwell: number };

const ACTS = [
  { letter: "A", name: "FLIGHT & HANDOFF", from: 0, to: 16, amp: 0.9 },
  { letter: "B", name: "THE WINDOW", from: 17, to: 21, amp: 0.6 },
  { letter: "C", name: "THE LAPTOP", from: 22, to: 34, amp: 0.35 },
  { letter: "D", name: "FIRST PERSON", from: 35, to: 38, amp: 0.7 },
  { letter: "E", name: "THE EXIT", from: 39, to: 42, amp: 0.5 },
];

const FRAMES: Frame[] = [
  { label: "Inbound", cam: { f: [500, 280], k: 1.0 }, dwell: 2.55 },
  { label: "Tracking", cam: { f: [560, 275], k: 1.15 }, dwell: 1.15 },
  { label: "Tracking", cam: { f: [600, 270], k: 1.2 }, dwell: 1.15 },
  { label: "Slowing", cam: { f: [620, 275], k: 1.25 }, dwell: 1.15 },
  { label: "Hover", cam: { f: [585, 274], k: 1.18 }, dwell: 3.18 },
  { label: "Scan sweep", cam: { f: [580, 278], k: 1.2 }, dwell: 3.82 },
  { label: "Scan sweep", cam: { f: [588, 277], k: 1.22 }, dwell: 3.82 },
  { label: "Lock-on", cam: { f: [582, 284], k: 1.28 }, dwell: 1.91 },
  { label: "Descent", cam: { f: [560, 300], k: 1.35 }, dwell: 1.40 },
  { label: "Touchdown", cam: { f: [480, 330], k: 1.5 }, dwell: 1.66 },
  { label: "Runner", cam: { f: [560, 320], k: 1.45 }, dwell: 1.27 },
  { label: "Pickup", cam: { f: [450, 350], k: 1.7 }, dwell: 1.91 },
  { label: "Carry", cam: { f: [560, 340], k: 1.5 }, dwell: 1.27 },
  { label: "Handoff", cam: { f: [620, 350], k: 1.8 }, dwell: 1.66 },
  { label: "Boarding", cam: { f: [670, 350], k: 1.8 }, dwell: 1.15 },
  { label: "Ignition", cam: { f: [640, 340], k: 1.6 }, dwell: 1.27 },
  { label: "Pull-away", cam: { f: [660, 335], k: 1.7 }, dwell: 1.15 },
  { label: "Side window", cam: { f: [660, 360], k: 2.0 }, dwell: 1.15 },
  { label: "Through glass", cam: { f: [700, 375], k: 3.0 }, dwell: 1.02 },
  { label: "The operator", cam: { f: [715, 382], k: 3.8 }, dwell: 1.15 },
  { label: "The monitor", cam: { f: [718, 384], k: 5.0 }, dwell: 1.02 },
  { label: "Screen fills", cam: { f: [718, 384], k: 7.5 }, dwell: 0.76 },
  { label: "Desktop", cam: { f: [500, 280], k: 1.0 }, dwell: 1.78 },
  { label: "Drone folder", cam: { f: [470, 280], k: 1.06 }, dwell: 1.40 },
  { label: "Upload", cam: { f: [500, 282], k: 1.1 }, dwell: 1.27 },
  { label: "Press", cam: { f: [560, 300], k: 1.18 }, dwell: 0.89 },
  { label: "Solving", cam: { f: [500, 290], k: 1.08 }, dwell: 1.02 },
  { label: "Solving", cam: { f: [520, 285], k: 1.12 }, dwell: 1.02 },
  { label: "Map pops", cam: { f: [500, 280], k: 1.0 }, dwell: 1.53 },
  { label: "Push in", cam: { f: [640, 280], k: 1.45 }, dwell: 1.15 },
  { label: "Window fills", cam: { f: [740, 280], k: 2.4 }, dwell: 0.89 },
  { label: "Location A", cam: { f: [500, 280], k: 1.0 }, dwell: 1.78 },
  { label: "Location B", cam: { f: [505, 285], k: 1.04 }, dwell: 1.53 },
  { label: "Route preview", cam: { f: [560, 330], k: 1.25 }, dwell: 0.89 },
  { label: "Route draws", cam: { f: [500, 290], k: 1.05 }, dwell: 1.78 },
  { label: "Into the map", cam: { f: [600, 280], k: 1.9 }, dwell: 0.76 },
  { label: "Street level", cam: { f: [500, 280], k: 1.0 }, dwell: 1.53 },
  { label: "Walking", cam: { f: [500, 272], k: 1.05 }, dwell: 1.53 },
  { label: "The shop", cam: { f: [500, 264], k: 1.1 }, dwell: 1.53 },
  { label: "Over the shoulder", cam: { f: [505, 288], k: 1.03 }, dwell: 1.53 },
  { label: "The phone", cam: { f: [505, 292], k: 1.04 }, dwell: 1.40 },
  { label: "The street", cam: { f: [500, 285], k: 1.0 }, dwell: 2.29 },
  { label: "New survey", cam: { f: [500, 282], k: 1.02 }, dwell: 2.80 },
];

const N = FRAMES.length;
const STARTS: number[] = [];
{
  let acc = 0;
  for (const f of FRAMES) {
    STARTS.push(acc);
    acc += f.dwell;
  }
}
const TOTAL = STARTS[N - 1] + FRAMES[N - 1].dwell;

const actOf = (i: number) => ACTS.find((a) => i >= a.from && i <= a.to) ?? ACTS[0];

function cubicSmoothstep(u: number): number {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
}

function expLerp(a: number, b: number, u: number): number {
  return Math.exp(Math.log(a) * (1 - u) + Math.log(b) * u);
}

function getParametricCamera(t: number): { x: number; y: number; k: number; label: string; scene: string; s: number } {
  const time = Math.max(0, Math.min(60, t));

  if (time <= 24.0) {
    // Act 1: Drone Survey -> Vehicle Handoff -> Push into Laptop Screen
    const u = time / 24.0;
    const s = u * 24; // s in [0, 24] for StreetScene
    if (time <= 8.0) {
      const p = cubicSmoothstep(time / 8.0);
      return { x: lerp(500, 580, p), y: lerp(280, 300, p), k: expLerp(1.0, 1.25, p), label: "Drone Survey Flight", scene: "street", s };
    } else if (time <= 16.0) {
      const p = cubicSmoothstep((time - 8.0) / 8.0);
      return { x: lerp(580, 660, p), y: lerp(300, 350, p), k: expLerp(1.25, 1.8, p), label: "Vehicle Ground Handoff", scene: "street", s };
    } else {
      const p = cubicSmoothstep((time - 16.0) / 8.0);
      return { x: lerp(660, 718, p), y: lerp(350, 384, p), k: expLerp(1.8, 6.0, p), label: "Through Window to Monitor", scene: "street", s };
    }
  } else if (time <= 38.0) {
    // Act 2: Laptop OS -> Drone Folder Ingestion -> Pipeline Solver -> 3D Map Window
    const u = (time - 24.0) / 14.0;
    const s = 24 + u * 13; // s in [24, 37] for LaptopScene
    if (time <= 34.0) {
      return { x: 500, y: 280, k: 1.0, label: "Drone File Pipeline Ingestion", scene: "laptop", s };
    } else {
      const p = cubicSmoothstep((time - 34.0) / 4.0);
      return { x: lerp(500, 740, p), y: 280, k: expLerp(1.0, 2.4, p), label: "3D Spatial Map Pop-up", scene: "laptop", s };
    }
  } else if (time <= 46.0) {
    // Act 3: 3D Map Route Planner & Preview
    const u = (time - 38.0) / 8.0;
    const s = 37 + u * 5; // s in [37, 42] for MapAppScene
    const p = cubicSmoothstep(u);
    return { x: 500, y: 280, k: expLerp(1.0, 1.8, p), label: "3D Route Calculation & Preview", scene: "map", s };
  } else if (time <= 54.0) {
    // Act 4: Zoom out to Phone display held on street by walking pedestrian
    const u = (time - 46.0) / 8.0;
    const s = 42 + u * 3; // s in [42, 45] for PovContent
    const p = cubicSmoothstep(u);
    return { x: lerp(500, 505, p), y: lerp(280, 288, p), k: expLerp(1.0, 1.04, p), label: "Street Navigation on Phone", scene: "pov", s };
  } else {
    // Act 5: Arrival at Destination Doorstep
    const u = (time - 54.0) / 6.0;
    const s = 45 + u * 2; // s in [45, 47] for ExitSequence
    const p = cubicSmoothstep(u);
    return { x: lerp(505, 500, p), y: lerp(288, 282, p), k: expLerp(1.04, 1.0, p), label: "Doorstep Destination Reached", scene: "exit", s };
  }
}

function grainFor(s: number) {
  if (s < 28) return 0.1;
  if (s < 42) return 0;
  if (s < 45) return 0.1;
  return 0.08;
}

export function DemoSection() {
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const plateRef = useRef<HTMLDivElement | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hold || reduced.current) return;
    let raf: number;
    let last: number | null = null;
    const tick = (t: number) => {
      if (last === null) last = t;
      const dt = (t - last) / 1000;
      last = t;
      setProgress((p) => (p + dt / TOTAL) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, hold]);

  const t = progress * TOTAL;
  
  // Scratch Pure Parametric Camera Trajectory Engine (0s - 60s continuous C1/C2 smoothstep)
  const camData = getParametricCamera(t);
  const rawX = camData.x;
  const rawY = camData.y;
  const rawK = camData.k;
  const frameLabel = camData.label;
  const scene = camData.scene;
  const s = camData.s;

  // Mathematically precise camera framing bounds to prevent canvas edge leaks
  const halfW = 500 / rawK;
  const halfH = 280 / rawK;
  const minX = halfW;
  const maxX = 1000 - halfW;
  const minY = halfH;
  const maxY = 560 - halfH;

  const targetX = minX >= maxX ? 500 : Math.min(maxX, Math.max(minX, rawX));
  const targetY = minY >= maxY ? 280 : Math.min(maxY, Math.max(minY, rawY));

  // Fluid camera transform with guaranteed bounds safety
  const camTransform = `translate(${(500 - targetX * rawK).toFixed(2)} ${(280 - targetY * rawK).toFixed(2)}) scale(${rawK.toFixed(4)})`;

  const grain = grainFor(s);

  const onScrub = (v: number) => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setHold(true);
    setProgress(v);
  };
  const onScrubEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHold(false), 2500);
  };

  return (
    <Section id="demo" num="05 — The demo" title={SITE.demo.heading} intro={SITE.demo.intro}>
      <Reveal>
        <div className="rounded-sm border border-line bg-paper p-[clamp(0.75rem,2vw,1.5rem)]">
          <div ref={plateRef} className="relative overflow-hidden rounded-sm border border-line bg-[#f1ece1] shadow-[0_14px_30px_-22px_rgba(27,23,18,0.45)] demo-canvas-ratio">
            {/* Scanline sweep — camera/sensor aesthetic */}
            <div className="scanline-sweep" aria-hidden="true" />
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" role="img" aria-label="One continuous take from a drone survey to a route on a phone">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dfe7ec" />
                  <stop offset="62%" stopColor="#eef0ea" />
                  <stop offset="100%" stopColor="#f6efe1" />
                </linearGradient>
                <radialGradient id="sun" cx="84%" cy="9%" r="22%">
                  <stop offset="0%" stopColor="#fff3df" />
                  <stop offset="100%" stopColor="#fff3df" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="vig" cx="50%" cy="50%" r="72%">
                  <stop offset="55%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </radialGradient>
                <filter id="grain">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.06" />
                  </feComponentTransfer>
                  <feComposite operator="over" in2="SourceGraphic" />
                </filter>
              </defs>

              <rect x="0" y="0" width={W} height={H} fill="url(#sky)" />
              <rect x="0" y="0" width={W} height={H} fill="url(#sun)" />

              <g transform={camTransform}>
                {scene === "street" && <StreetScene s={s} />}
                {scene === "laptop" && <LaptopScene s={s} />}
                {scene === "map" && <MapAppScene s={s} />}
                {scene === "pov" && <PovContent q={s - 42} />}
                {scene === "exit" && <ExitSequence s={s} />}
              </g>

              {grain > 0 && <rect x="0" y="0" width={W} height={H} filter="url(#grain)" opacity={grain} />}
              <rect x="0" y="0" width={W} height={H} fill="url(#vig)" opacity={0.35} />
            </svg>
          </div>

          <div className="mt-4">
            {/* Quick-jump Chapters */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted font-bold mr-1">
                SEQUENCE:
              </span>
              {[
                { label: "01 · Drone Survey (0s)", t: 0 },
                { label: "02 · SfM Pipeline (28s)", t: 28 / TOTAL },
                { label: "03 · Route Planner (37s)", t: 37 / TOTAL },
                { label: "04 · Street POV (42s)", t: 42 / TOTAL },
              ].map((ch) => {
                const isActive = Math.abs(progress - ch.t) < 0.08;
                return (
                  <button
                    key={ch.label}
                    onClick={() => {
                      onScrub(ch.t);
                      onScrubEnd();
                    }}
                    className={`px-2.5 py-1 rounded border font-mono text-[0.62rem] uppercase tracking-wider transition-colors cursor-pointer ${
                      isActive
                        ? "bg-accent text-white border-accent font-semibold"
                        : "bg-paper-deep/70 hover:bg-paper-deep text-ink border-line-strong/60"
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.0001}
              value={progress}
              onChange={(e) => onScrub(Number(e.target.value))}
              onPointerUp={onScrubEnd}
              onKeyUp={onScrubEnd}
              className="demo-range w-full h-8 md:h-[2px]"
              aria-label="One-shot timeline scrubber"
              style={{ touchAction: "none" }}
            />
            <div className="mt-1.5 flex flex-col md:flex-row items-center justify-between gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-muted">
              <span>One continuous take · {Math.round(TOTAL)}s · 60 FPS · loops</span>
              <span className="font-bold text-accent">PROGRESS: {(progress * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
