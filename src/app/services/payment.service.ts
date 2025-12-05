import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentConfirmation {
  success: boolean;
  paymentIntentId: string;
  status: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Create a Payment Intent on the server
   * @param amount - Amount in cents (e.g., 5000 = $50.00)
   * @param currency - Currency code (e.g., 'usd')
   * @param metadata - Optional metadata object
   */
  createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: any
  ): Observable<PaymentIntentResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/create-payment-intent`,
      { amount, currency, metadata },
      { headers }
    );
  }

  /**
   * Confirm payment status on the server
   * @param paymentIntentId - The Payment Intent ID
   */
  confirmPayment(paymentIntentId: string): Observable<PaymentConfirmation> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<PaymentConfirmation>(
      `${this.apiUrl}/confirm-payment`,
      { paymentIntentId },
      { headers }
    );
  }

  /**
   * Retrieve payment details
   * @param paymentIntentId - The Payment Intent ID
   */
  getPaymentDetails(paymentIntentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/${paymentIntentId}`);
  }
}
