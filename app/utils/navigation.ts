import type { ProjectFilter } from "~/types/project";

/** Tautan navigasi utama (header desktop & mobile). */
export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

/** Filter kategori project pada bagian Work. */
export const PROJECT_FILTERS: ProjectFilter[] = [
  { value: "all", label: "All" },
  { value: "web", label: "Web App" },
  { value: "mobile", label: "Mobile" },
  { value: "oss", label: "Open Source" },
];
