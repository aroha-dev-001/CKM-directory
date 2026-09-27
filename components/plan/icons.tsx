import type { ReactNode } from "react";

/* Small stroke icons for the planner's fact rows. Decorative only: every one
   sits beside a text label, so they are hidden from assistive tech. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg className="pl-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const IconClock = () => (
  <Icon>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const IconBoot = () => (
  <Icon>
    <path d="M7 3.5h5v7.5l6.2 2.3a2.5 2.5 0 0 1 1.6 2.3V18H4.5v-5.5L7 11z" />
    <path d="M4.5 20.5h15.3" />
  </Icon>
);

export const IconCalendar = () => (
  <Icon>
    <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </Icon>
);

export const IconSun = () => (
  <Icon>
    <circle cx="12" cy="12" r="3.8" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </Icon>
);

export const IconPeak = () => (
  <Icon>
    <path d="m3 19 6.5-11 4 6.5 2.5-3.5L21 19z" />
  </Icon>
);

export const IconRoute = () => (
  <Icon>
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="6" r="2.2" />
    <path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" />
  </Icon>
);

export const IconPermit = () => (
  <Icon>
    <path d="M12 3.5 19 6v5.5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

export const IconMoon = () => (
  <Icon>
    <path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z" />
  </Icon>
);

export const IconLink = () => (
  <Icon>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
);

export const IconExternal = () => (
  <Icon>
    <path d="M14 4.5h5.5V10M19.5 4.5 11 13" />
    <path d="M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10" />
  </Icon>
);
