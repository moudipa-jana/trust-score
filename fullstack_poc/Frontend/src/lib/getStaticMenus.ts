import { BottomMenuService, MenuService, SOCIAL_QUERY } from '@/service';
import cmsClient from '@/service/cmsClient';

export default async function getStaticMenus() {
  try {
    const [menuResponse, bottomMenuResponse, socialResponse] =
      await Promise.all([
        MenuService(),
        BottomMenuService(),
        cmsClient.query({ query: SOCIAL_QUERY }),
      ]);

    const initialMenus = (menuResponse.data as any)?.menus?.data || [];
    const initialBottomMenus =
      (bottomMenuResponse.data as any)?.bottomMenus?.data || [];
    const initialSocials = (socialResponse.data as any)?.socials?.data || [];

    return {
      initialMenus,
      initialBottomMenus,
      initialSocials,
    };
  } catch (error) {
    console.error('Failed to fetch static data:', error);
    return {
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
    };
  }
}
