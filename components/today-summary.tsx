"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { Paper, Text, Title, Group, Stack, Skeleton } from "@mantine/core"
import type { CalorieEntry } from "@/types/calorie-entry"

const MACROS = [
  { key: "protein", label: "Protein", color: "var(--macro-protein)", target: 140 },
  { key: "carbs", label: "Carbs", color: "var(--macro-carbs)", target: 220 },
  { key: "fat", label: "Fat", color: "var(--macro-fat)", target: 70 },
] as const

const RADIUS = 56
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Totals {
  calories: number
  protein: number
  carbs: number
  fat: number
  count: number
}

const EMPTY: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }

export function TodaySummary({ refreshKey = 0 }: { refreshKey?: number }) {
  const [totals, setTotals] = useState<Totals>(EMPTY)
  const [calorieTarget, setCalorieTarget] = useState(2000)
  const [proteinTarget, setProteinTarget] = useState(140)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const today = format(new Date(), "yyyy-MM-dd")

    try {
      const [entriesRes, targetsRes] = await Promise.allSettled([
        fetch(`/api/entries?startDate=${today}&endDate=${today}`).then((r) => r.json()),
        fetch("/api/targets").then((r) => r.json()),
      ])

      if (entriesRes.status === "fulfilled" && entriesRes.value?.success) {
        const entries: CalorieEntry[] = entriesRes.value.entries ?? []
        setTotals(
          entries.reduce<Totals>(
            (acc, e) => ({
              calories: acc.calories + (Number(e.calories) || 0),
              protein: acc.protein + (Number(e.protein) || 0),
              carbs: acc.carbs + (Number(e.carbs) || 0),
              fat: acc.fat + (Number(e.fat) || 0),
              count: acc.count + 1,
            }),
            EMPTY,
          ),
        )
      }

      if (targetsRes.status === "fulfilled" && targetsRes.value?.success) {
        const t = targetsRes.value.targets
        if (t?.calorieTarget) setCalorieTarget(Number(t.calorieTarget))
        if (t?.proteinTarget) setProteinTarget(Number(t.proteinTarget))
      }
    } catch (error) {
      console.error("Error loading today's summary:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const consumed = Math.round(totals.calories)
  const remaining = calorieTarget - consumed
  const rawPct = calorieTarget > 0 ? consumed / calorieTarget : 0
  // Ring geometry: the green arc fills to target, then a red arc layers on top
  // showing how far past target you've gone (itself capped at one more lap).
  const pct = Math.min(rawPct, 1)
  const overPct = Math.min(Math.max(rawPct - 1, 0), 1)
  const over = remaining < 0

  const macroTargets: Record<string, number> = {
    protein: proteinTarget,
    carbs: 220,
    fat: 70,
  }

  return (
    <Paper
      p="xl"
      radius="lg"
      withBorder
      style={{
        borderColor: "hsl(var(--border))",
        backgroundColor: "hsl(var(--card))",
        boxShadow: "0 1px 3px rgba(20, 50, 30, 0.05)",
        // Macro identity colors, fixed per macro wherever they appear
        ["--macro-protein" as string]: "hsl(var(--chart-2))",
        ["--macro-carbs" as string]: "hsl(var(--chart-3))",
        ["--macro-fat" as string]: "hsl(var(--chart-4))",
      }}
    >
      <Stack gap="lg">
        <div>
          <Title order={2} style={{ fontSize: "1.35rem" }}>
            Today
          </Title>
          <Text size="sm" c="dimmed">
            {format(new Date(), "EEEE, MMMM d")}
          </Text>
        </div>

        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center">
          {/* Calorie ring */}
          <div className="relative flex-none" style={{ width: 148, height: 148 }}>
            <svg width="148" height="148" viewBox="0 0 148 148" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="74" cy="74" r={RADIUS} fill="none" stroke="hsl(var(--accent))" strokeWidth="13" />
              <circle
                cx="74"
                cy="74"
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * pct} ${CIRCUMFERENCE}`}
                style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
              {overPct > 0 && (
                <circle
                  cx="74"
                  cy="74"
                  r={RADIUS}
                  fill="none"
                  stroke="hsl(var(--destructive))"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE * overPct} ${CIRCUMFERENCE}`}
                  style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isLoading ? (
                <Skeleton height={28} width={70} radius="sm" />
              ) : (
                <span className="stat-number text-[1.7rem] text-emphasis">{consumed.toLocaleString()}</span>
              )}
              <span className="mt-0.5 text-[11px] text-muted-foreground">of {calorieTarget.toLocaleString()} kcal</span>
            </div>
          </div>

          {/* Macro bars */}
          <div className="flex w-full flex-1 flex-col gap-3.5">
            {MACROS.map(({ key, label, color }) => {
              const value = totals[key]
              const target = macroTargets[key] ?? 1
              const width = target > 0 ? Math.min((value / target) * 100, 100) : 0
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-baseline justify-between text-[12.5px] font-medium">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {Math.round(value)} / {target} g
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${width}%`,
                        backgroundColor: color,
                        transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stat tiles */}
        <Group grow gap="sm" wrap="nowrap" data-stat-tiles>
          <div className="rounded-lg bg-accent px-4 py-3">
            <div className={`stat-number text-xl ${over ? "text-destructive" : "text-emphasis"}`}>
              {over ? `+${Math.abs(remaining).toLocaleString()}` : remaining.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {over ? "kcal over target" : "kcal remaining"}
            </div>
          </div>
          <div className="rounded-lg bg-accent px-4 py-3">
            <div className="stat-number text-xl text-emphasis">{totals.count}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {totals.count === 1 ? "meal logged" : "meals logged"}
            </div>
          </div>
          <div className="rounded-lg bg-accent px-4 py-3">
            <div className={`stat-number text-xl ${over ? "text-destructive" : "text-emphasis"}`}>
              {Math.round(rawPct * 100)}%
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">of daily target</div>
          </div>
        </Group>
      </Stack>
    </Paper>
  )
}
