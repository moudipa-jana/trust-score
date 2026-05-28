export interface ContactReason {
  id: string;
  reason: string;
  created_at: string;
  __typename: string;
}

export interface ContactUsData {
  contact_us_reasons: ContactReason[];
}
