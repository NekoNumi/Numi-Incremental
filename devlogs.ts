import changelog030 from "./devlogs/0.3.0.json";

export interface ChangelogEntry {
  version: string;
  releaseId: string;
  notes: string[];
}

const changelogEntries: ChangelogEntry[] = [changelog030];

export function getChangelogEntries(): ChangelogEntry[] {
  return [...changelogEntries];
}
