interface GTMEvent {
  event: string;
  [key: string]: unknown;
}

interface Window {
  dataLayer?: GTMEvent[];
}

// Track an event with Google Tag Manager
function gtmEvent(eventName: string, extras: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && (window as Window).dataLayer) {
    (window as Window).dataLayer?.push({
      event: eventName,
      ...extras,
    });
  }
}

const track = {
  initialize: () => {},

  register: (
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: number,
    gender: string,
    type = 'credentials',
  ) => {
    gtmEvent('signup', {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      type,
    });
  },

  pageView: (page: string) => {
    gtmEvent('pageview', { page });
  },
};

export default track;
