import { getStrapiURL } from '@/lib/helpers';

interface OptinType {
  folds: string;
}

interface RequestOptions {
  headers: {
    'Content-Type': string;
  };
}

async function fetchAPI(
  path: string,
  urlParamsObject: string | null | undefined,
  param?: OptinType,
) {
  const mergedOptions: RequestOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const queryString = urlParamsObject;

  const requestUrl = `${getStrapiURL(
    `/api/${path}${queryString ? `=${queryString}` : ''}&${
      param ? param.folds : 'populate=*'
    }`,
  )}`;

  try {
    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('404');
  }
}

export default fetchAPI;
