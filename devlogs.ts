import changelog030 from "./devlogs/0.3.0.json";
import changelog032 from "./devlogs/0.3.2.json";
import changelog033 from "./devlogs/0.3.3.json";

export interface ChangelogEntry {
  version: string;
  releaseId: string;
  notes: string[];
}

const changelogEntries: ChangelogEntry[] = [changelog033, changelog032, changelog030];

export function getChangelogEntries(): ChangelogEntry[] {
  return [...changelogEntries];
}
