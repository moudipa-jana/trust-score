export interface MenuItem {
  id: number;
  attributes: {
    title: string;
    slug: string;
    order?: number;
    isActive?: boolean;
    icon?: string;
    children?: MenuItem[];
  };
}

export interface MenuData {
  menus?: {
    data: MenuItem[];
  };
}

export interface BottomMenuData {
  bottomMenus?: {
    data: MenuItem[];
  };
}

export interface MenuState {
  items: MenuItem[];
  bottomItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}

export interface MenuContextType {
  menus: MenuItem[];
  bottomMenus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
}

export interface MenuProps {
  items: MenuItem[];
  className?: string;
  onItemClick?: (item: MenuItem) => void;
}

export interface BottomMenuProps {
  items: MenuItem[];
  className?: string;
  onItemClick?: (item: MenuItem) => void;
}
