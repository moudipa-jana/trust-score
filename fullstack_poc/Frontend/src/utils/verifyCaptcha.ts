import ReCAPTCHA from 'react-google-recaptcha';

const onReCAPTCHAChange = async (
  token: string | null,
  ref: React.RefObject<ReCAPTCHA>,
  setrecaptchaToken?: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  if (!token) {
    setrecaptchaToken?.(null);
    return;
  }
  try {
    const response = await fetch('/api/captcha', {
      method: 'POST',
      body: JSON.stringify({ captcha: token }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      setrecaptchaToken?.(token);
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Something went wrong');
  }
};

export default onReCAPTCHAChange;
