export const fetchQuery = async (payload: any) => {
  try {
    const response = await fetch('https://test-health-chat.kofuku.com/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.warn('fetchQuery failed, returning mock response', error);
    return {
      answer:
        'Coming soon. This chat experience is still being built — check back shortly.',
      confidence: 'low',
      most_likely_conditions: [],
      supportive_advice: [],
    };
  }
};
