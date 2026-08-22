import {
  IconAddressBook,
  IconAlertTriangle,
  IconArticle,
  IconBrandGithub,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCard,
  IconDotsVertical,
  IconInbox,
  IconLayoutDashboard,
  IconLoader2,
  IconMicroscope,
  IconPlus,
  IconProps,
  IconSearch,
  IconShieldLock,
  IconSparkles,
  IconStethoscope,
  IconTrash,
  IconUsers,
  IconX
} from '@tabler/icons-react';

export type Icon = React.ComponentType<IconProps>;

/**
 * Icon registry.
 *
 * Kept deliberately small — this previously imported ~60 icons of which 15 were
 * referenced. Each nav entry below takes a DISTINCT glyph: when the sidebar
 * collapses to the icon rail the glyph is the only label, so two sections
 * sharing an icon makes the rail unusable. Patients/Contacts and
 * Enquiries/Research used to collide.
 */
export const Icons = {
  // Navigation — one distinct glyph per section
  dashboard: IconLayoutDashboard,
  patients: IconStethoscope,
  enquiries: IconInbox,
  prompts: IconSparkles,
  blog: IconArticle,
  research: IconMicroscope,
  contacts: IconAddressBook,
  userManagement: IconShieldLock,

  // General UI
  logo: IconStethoscope,
  add: IconPlus,
  check: IconCheck,
  close: IconX,
  search: IconSearch,
  spinner: IconLoader2,
  trash: IconTrash,
  ellipsis: IconDotsVertical,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  warning: IconAlertTriangle,
  billing: IconCreditCard,
  github: IconBrandGithub,

  // Back-compat aliases for call sites not yet migrated
  users: IconUsers,
  post: IconInbox,
  health: IconStethoscope
};
