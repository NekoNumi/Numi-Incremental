import changelog030 from "./devlogs/0.3.0.json";
import changelog032 from "./devlogs/0.3.2.json";

export interface ChangelogEntry {
  version: string;
  releaseId: string;
  notes: string[];
}

const changelogEntries: ChangelogEntry[] = [changelog032, changelog030];

export function getChangelogEntries(): ChangelogEntry[] {
  return [...changelogEntries];
}
