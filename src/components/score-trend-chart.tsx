"use client";

import { useId, useState } from "react";
import { PASSING_SCALED_SCORE, SCALED_SCORE_MAX, SCALED_SCORE_MIN } from "@/lib/scoring";
import type { MockExamSummary } from "@/lib/progress-types";

const CHART_HEIGHT = 220;
const BAR_MAX_WIDTH = 24;
const GAP = 2;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const PADDING_X = 4;

export function ScoreTrendChart({ history }: { history: MockExamSummary[] }) {
  const gradientId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const completed = [...history]
    .filter((h) => h.scaledScore != null && h.completedAt)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

  if (completed.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-foreground-muted">
        Complete a mock exam to see your score trend here.
      </div>
    );
  }

  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const range = SCALED_SCORE_MAX - SCALED_SCORE_MIN;
  const yFor = (score: number) => PADDING_TOP + plotHeight * (1 - (score - SCALED_SCORE_MIN) / range);
  const passingY = yFor(PASSING_SCALED_SCORE);

  const barSlot = Math.min(BAR_MAX_WIDTH + GAP, 48);
  const chartWidth = Math.max(240, completed.length * barSlot + PADDING_X * 2);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">Mock exam score trend</h3>
        <span className="text-xs text-foreground-muted">Passing line at {PASSING_SCALED_SCORE}</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          role="img"
          aria-label={`Mock exam scores over time, from ${completed[0].scaledScore} to ${completed[completed.length - 1].scaledScore}, out of ${SCALED_SCORE_MAX}. Passing score is ${PASSING_SCALED_SCORE}.`}
          width={chartWidth}
          height={CHART_HEIGHT}
          className="min-w-full"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* gridlines at 100-scale ticks */}
          {[100, 400, 700, 1000].map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING_X}
                x2={chartWidth - PADDING_X}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text x={0} y={yFor(tick) + 3} fontSize={10} fill="var(--foreground-muted)">
                {tick}
              </text>
            </g>
          ))}

          {/* passing threshold reference line */}
          <line
            x1={PADDING_X}
            x2={chartWidth - PADDING_X}
            y1={passingY}
            y2={passingY}
            stroke="var(--success)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />

          {completed.map((exam, i) => {
            const score = exam.scaledScore!;
            const x = PADDING_X + i * barSlot;
            const barWidth = Math.min(BAR_MAX_WIDTH, barSlot - GAP);
            const top = yFor(score);
            const barHeight = CHART_HEIGHT - PADDING_BOTTOM - top;
            const isHovered = hovered === i;
            const isLast = i === completed.length - 1;

            return (
              <g key={exam.id}>
                <rect
                  x={x}
                  y={top}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  fill={`url(#${gradientId})`}
                  opacity={isHovered ? 1 : 0.9}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Attempt ${i + 1}, ${new Date(exam.completedAt!).toLocaleDateString()}: ${score}`}
                />
                {isLast && (
                  <text
                    x={x + barWidth / 2}
                    y={top - 6}
                    fontSize={11}
                    textAnchor="middle"
                    fill="var(--foreground)"
                    fontWeight={600}
                  >
                    {score}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={CHART_HEIGHT - 10}
                  fontSize={9}
                  textAnchor="middle"
                  fill="var(--foreground-muted)"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hovered != null && (
        <p className="mt-2 text-sm text-foreground-muted" aria-live="polite">
          Attempt {hovered + 1} ({new Date(completed[hovered].completedAt!).toLocaleDateString()}):{" "}
          <strong className="text-foreground">{completed[hovered].scaledScore}</strong> / {SCALED_SCORE_MAX}
        </p>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-foreground-muted hover:text-foreground">
          View as table
        </summary>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-foreground-muted">
              <th className="py-1 pr-4">Attempt</th>
              <th className="py-1 pr-4">Date</th>
              <th className="py-1 pr-4">Score</th>
              <th className="py-1">Result</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((exam, i) => (
              <tr key={exam.id} className="border-t border-border">
                <td className="py-1 pr-4">{i + 1}</td>
                <td className="py-1 pr-4">{new Date(exam.completedAt!).toLocaleDateString()}</td>
                <td className="py-1 pr-4 tabular-nums">{exam.scaledScore}</td>
                <td className="py-1">{exam.passed ? "Passing" : "Below passing"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
