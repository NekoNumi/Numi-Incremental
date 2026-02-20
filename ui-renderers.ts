interface ResourceStatsViewArgs {
  resourceStatsPanel: HTMLElement | null;
  resourceStatsToggle: HTMLButtonElement | null;
  isOpen: boolean;
}

interface UpgradesAccordionViewArgs {
  upgradesAccordionBody: HTMLElement | null;
  toggleUpgradesAccordion: HTMLButtonElement | null;
  isOpen: boolean;
}

export function renderResourceStatsPanelView(args: ResourceStatsViewArgs): void {
  if (!args.resourceStatsPanel || !args.resourceStatsToggle) {
    return;
  }

  args.resourceStatsPanel.classList.toggle("hidden", !args.isOpen);
  args.resourceStatsToggle.setAttribute("aria-expanded", String(args.isOpen));
}

export function renderUpgradesAccordionView(args: UpgradesAccordionViewArgs): void {
  if (args.upgradesAccordionBody) {
    args.upgradesAccordionBody.classList.toggle("hidden", !args.isOpen);
  }

  if (args.toggleUpgradesAccordion) {
    args.toggleUpgradesAccordion.textContent = args.isOpen ? "▾" : "▸";
    args.toggleUpgradesAccordion.setAttribute("aria-expanded", String(args.isOpen));
    args.toggleUpgradesAccordion.setAttribute("aria-label", args.isOpen ? "Collapse upgrades" : "Expand upgrades");
  }
}
