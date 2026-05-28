declare module 'react-google-recaptcha' {
  import * as React from 'react';

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    size?: 'compact' | 'normal' | 'invisible';
    theme?: 'light' | 'dark';
    type?: 'image' | 'audio';
    tabindex?: number;
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {}
}
