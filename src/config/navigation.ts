/** Header navigation. `collection` items link to /collections/<slug>. */
export type NavItem =
  { label: string; to: "/shop" | "/wholesale" } | { label: string; collection: string };

export const MAIN_NAV: NavItem[] = [
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", collection: "new-arrivals" },
  { label: "Women", collection: "women" },
  { label: "Unisex", collection: "unisex" },
  { label: "Korean Fashion", collection: "korean" },
  { label: "Best Finds", collection: "imported" },
  { label: "Wholesale", to: "/wholesale" },
];

export const HELP_LINKS = [
  { label: "About DB Hub", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
  { label: "Wholesale enquiries", to: "/wholesale" },
] as const;

export const POLICY_LINKS = [
  { label: "Shipping policy", to: "/policies/shipping" },
  { label: "Returns & refunds", to: "/policies/returns" },
  { label: "Privacy policy", to: "/policies/privacy" },
  { label: "Terms & conditions", to: "/policies/terms" },
] as const;
