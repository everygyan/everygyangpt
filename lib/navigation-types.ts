export type NavigationItem = {
  id: string;
  label: string;
  href: string | null;
  children: NavigationItem[];
};

