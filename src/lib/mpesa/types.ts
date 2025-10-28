/* M-Pesa API return shapes */

export interface MpesaAuthResponse {
  access_token: string;
  expires_in:   number;
}

export interface STKPushResponse {
  CheckoutRequestID:   string;
  MerchantRequestID:   string;
  ResponseCode:        string;
  ResponseDescription: string;
  CustomerMessage:     string;
}

export interface RegisterC2BUrlResponse {
  ConversationID:           string;
  OriginatorCoversationID:  string;
  ResponseCode:             string;
  ResponseDescription:      string;
}
