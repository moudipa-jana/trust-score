interface ImageData {
  data: {
    attributes: {
      url: string;
    };
  };
}

interface CoverImage {
  image: ImageData;
  altText?: string;
}

interface Section {
  Title?: string;
  title?: string;
  Description?: string;
  altText?: string;
  description: string;
  coverImg?: CoverImage;
}

export interface JoinUsAttributes {
  heroSection: Section & {
    coverImg: ImageData;
  };
  TeamProductSection: Section & {
    coverImg: ImageData;
  };
  TeamContentSection: Section & {
    coverImg: ImageData;
  };
  TeamTechnologySection: Section & {
    coverImg: ImageData;
  };
  TeamCreativeSection: Section & {
    coverImg: ImageData;
  };
  TeamAdminSection: Section & {
    coverImg: ImageData;
  };
}

export interface JoinUsData {
  data: {
    attributes: JoinUsAttributes;
  };
}
