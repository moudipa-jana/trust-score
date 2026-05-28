import Cookies from 'js-cookie';

export const setCookiesToken = (token: string) => {
  Cookies.set('jwt', token, { expires: 365 });
};

export function isAuthenticatedUser() {
  const token = Cookies.get('jwt');
  return token ? true : false;
}

export function getUserToken() {
  const token = Cookies.get('jwt');
  return token ? token : '';
}

export function removeToken() {
  Cookies.remove('jwt');
}
