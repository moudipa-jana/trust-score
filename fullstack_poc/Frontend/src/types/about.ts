interface ImageData {
  data: {
    attributes: {
      url: string;
    };
  };
}

interface Section {
  title: string;
  description: string;
}

interface Memoir {
  id: string;
  attributes: {
    title: string;
    description: string;
    altText: string;
    image: ImageData;
  };
}

export interface Kofukon {
  attributes: {
    title: string;
    image: ImageData;
  };
}

interface HomeAttributes {
  title: string;
  video: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  who: Section;
  sunrise: Section;
  why: Section;
  Kofu: {
    title: string;
  };
  kofukons: {
    data: Kofukon[];
  };
  PersonalisedSearch: Section;
  memoirs: {
    data: Memoir[];
  };
}

export interface HomeData {
  home: {
    data: {
      attributes: HomeAttributes;
    };
  };
}

export interface KofukonsData {
  kofukons: {
    data: Kofukon[];
  };
}

export interface AboutProps {
  title: string;
  video: HomeAttributes['video'];
  who: Section;
  sunrise: Section;
  why: Section;
  Kofu: HomeAttributes['Kofu'];
  PersonalisedSearch: Section;
  kofukons: KofukonsData['kofukons']['data'];
  memoirs: Memoir[];
}

export interface SVGPathElement extends HTMLElement {
  getTotalLength(): number;
  style: CSSStyleDeclaration & {
    strokeDasharray: string;
    strokeDashoffset: number | string;
    transition?: string;
  };
  getBoundingClientRect(): DOMRect;
}
