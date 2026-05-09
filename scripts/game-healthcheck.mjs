#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const REPORT_PATH = resolve(ROOT, ".claude/game-healthcheck-latest.json");
const EXPECTED_NEXT_ENV = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

function nowIso() {
  return new Date().toISOString();
}

function runCommand(name, command, args) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return {
    name,
    command: [command, ...args].join(" "),
    startedAt: new Date(startedAt).toISOString(),
    endedAt: nowIso(),
    durationMs: Date.now() - startedAt,
    status: result.status ?? null,
    signal: result.signal ?? null,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ? String(result.error.message ?? result.error) : null,
  };
}

function restoreNextEnvIfNeeded() {
  const nextEnvPath = resolve(ROOT, "next-env.d.ts");
  try {
    const current = readFileSync(nextEnvPath, "utf8");
    if (current !== EXPECTED_NEXT_ENV) {
      writeFileSync(nextEnvPath, EXPECTED_NEXT_ENV);
      return true;
    }
  } catch {
    writeFileSync(nextEnvPath, EXPECTED_NEXT_ENV);
    return true;
  }
  return false;
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function evaluateSimulation(summary) {
  const issues = [];
  if (!summary) {
    issues.push({ level: "error", check: "simulation", message: "Simulator output could not be parsed as JSON." });
    return issues;
  }

  const modeLabel = summary.modeLabel ?? summary.config?.mode ?? "unknown";
  const reachedGodModeRate = typeof summary.reachedGodModeRate === "number" ? summary.reachedGodModeRate : null;
  const diedBeforeGodModeRate = typeof summary.diedBeforeGodModeRate === "number" ? summary.diedBeforeGodModeRate : null;

  if (reachedGodModeRate !== null && reachedGodModeRate < 1) {
    issues.push({
      level: reachedGodModeRate < 0.95 ? "error" : "warn",
      check: `sim:${modeLabel}`,
      message: `Not all runs reached God Mode (${(reachedGodModeRate * 100).toFixed(1)}%).`,
    });
  }
  if (diedBeforeGodModeRate !== null && diedBeforeGodModeRate > 0) {
    issues.push({
      level: "warn",
      check: `sim:${modeLabel}`,
      message: `${(diedBeforeGodModeRate * 100).toFixed(1)}% of runs ended before God Mode.`,
    });
  }
  if (!summary.failureReasons || typeof summary.failureReasons !== "object") {
    issues.push({
      level: "warn",
      check: `sim:${modeLabel}`,
      message: "Failure reasons were not returned by the simulator.",
    });
  }
  return issues;
}

function printSummary(report) {
  console.log(`Homefarm Healthcheck`);
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Report: ${report.reportPath}`);
  console.log("");
  for (const check of report.checks) {
    const status = check.status === 0 ? "PASS" : "FAIL";
    console.log(`[${status}] ${check.name} (${check.durationMs}ms)`);
    if (check.summary) {
      console.log(`  ${check.summary}`);
    }
  }
  console.log("");
  if (report.issues.length === 0) {
    console.log("No issues detected by the automated checks.");
  } else {
    console.log("Issues:");
    for (const issue of report.issues) {
      console.log(`  - [${issue.level}] ${issue.check}: ${issue.message}`);
    }
  }
}

function main() {
  mkdirSync(resolve(ROOT, ".claude"), { recursive: true });

  const checks = [];
  const issues = [];
  const build = runCommand("build", process.execPath, [resolve(ROOT, "node_modules/next/dist/bin/next"), "build", "--webpack"]);
  checks.push({
    ...build,
    summary: build.status === 0 ? "Production build completed successfully." : "Production build failed.",
  });
  if (build.status !== 0) {
    issues.push({ level: "error", check: "build", message: "Production build failed. See stderr for details." });
  }
  if (restoreNextEnvIfNeeded()) {
    issues.push({ level: "info", check: "build", message: "Restored next-env.d.ts after build." });
  }

  const lint = runCommand("lint", "npm", ["run", "lint"]);
  checks.push({
    ...lint,
    summary: lint.status === 0 ? "ESLint completed successfully." : "ESLint reported errors.",
  });
  if (lint.status !== 0) {
    issues.push({ level: "error", check: "lint", message: "ESLint reported errors. See stderr for details." });
  }

  const fullTimeSim = runCommand("sim:full-time", process.execPath, ["scripts/simulate-balance.mjs", "--mode", "full-time", "--runs", "100", "--days", "60", "--json"]);
  const fullTimeSummary = parseJsonSafe(fullTimeSim.stdout);
  checks.push({
    ...fullTimeSim,
    summary: fullTimeSim.status === 0
      ? `Full-time sim parsed. God Mode reach ${typeof fullTimeSummary?.reachedGodModeRate === "number" ? (fullTimeSummary.reachedGodModeRate * 100).toFixed(1) : "n/a"}%.`
      : "Full-time simulation failed.",
  });
  if (fullTimeSim.status !== 0) {
    issues.push({ level: "error", check: "sim:full-time", message: "Full-time simulator failed. See stderr for details." });
  } else {
    issues.push(...evaluateSimulation(fullTimeSummary));
  }

  const partTimeSim = runCommand("sim:part-time", process.execPath, ["scripts/simulate-balance.mjs", "--mode", "part-time", "--runs", "100", "--days", "60", "--json"]);
  const partTimeSummary = parseJsonSafe(partTimeSim.stdout);
  checks.push({
    ...partTimeSim,
    summary: partTimeSim.status === 0
      ? `Part-time sim parsed. God Mode reach ${typeof partTimeSummary?.reachedGodModeRate === "number" ? (partTimeSummary.reachedGodModeRate * 100).toFixed(1) : "n/a"}%.`
      : "Part-time simulation failed.",
  });
  if (partTimeSim.status !== 0) {
    issues.push({ level: "error", check: "sim:part-time", message: "Part-time simulator failed. See stderr for details." });
  } else {
    issues.push(...evaluateSimulation(partTimeSummary));
  }

  const report = {
    generatedAt: nowIso(),
    reportPath: REPORT_PATH,
    checks: checks.map((check) => ({
      name: check.name,
      command: check.command,
      startedAt: check.startedAt,
      endedAt: check.endedAt,
      durationMs: check.durationMs,
      status: check.status,
      signal: check.signal,
      summary: check.summary,
      error: check.error,
    })),
    issues,
    simulation: {
      fullTime: fullTimeSummary,
      partTime: partTimeSummary,
    },
  };

  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  printSummary(report);

  const hasError = issues.some((issue) => issue.level === "error");
  process.exit(hasError ? 1 : 0);
}

main();
