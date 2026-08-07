import type { ParseIssue } from "./types.js";

export const issue = (path: string, message: string): ParseIssue => {
  return { path, message };
};

const stringIssue = (issue: ParseIssue): string =>
  issue.path ? `${issue.path}: ${issue.message}` : issue.message;

export const formatParseError = (issues: ParseIssue[]): string => {
  if (issues.length === 0) {
    return "Invalid form definition";
  }
  const firstIssue = issues[0]!;
  if (issues.length === 1) {
    return stringIssue(firstIssue);
  }
  const remaining = issues.length - 1;
  return `${stringIssue(firstIssue)} (and ${remaining} additional ${remaining === 1 ? "issue" : "issues"})`;
};
