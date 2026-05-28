export interface BlogFoldProps {
  title?: string;
  description?: string;
  coverImg?: {
    image?: {
      data?: {
        attributes?: {
          url: string;
        };
      };
    };
    altText?: string;
  };
  Title?: string;
  trending?: boolean;
}
