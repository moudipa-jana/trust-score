import { createContext } from 'react';

export const TrustScoreContext = createContext<Record<string, number>>({});
