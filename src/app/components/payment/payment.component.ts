import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef;

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElementInstance: StripeCardElement | null = null;

  // Payment form data
  amount: number = 50.00;
  currency: string = 'usd';
  customerName: string = '';
  customerEmail: string = '';

  // UI state
  isProcessing: boolean = false;
  paymentSuccess: boolean = false;
  paymentError: string = '';
  clientSecret: string = '';
  paymentIntentId: string = '';

  constructor(private paymentService: PaymentService) { }

  ngOnInit() {
    // Initialization moved to ngAfterViewInit to ensure view is ready
  }

  async ngAfterViewInit() {
    // Initialize Stripe
    this.stripe = await loadStripe(environment.stripePublishableKey);
    
    if (this.stripe) {
      // Create Elements instance
      this.elements = this.stripe.elements();

      // Create and mount the card element
      this.cardElementInstance = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });

      if (this.cardElement) {
        this.cardElementInstance.mount(this.cardElement.nativeElement);

        // Listen for card element changes
        this.cardElementInstance.on('change', (event) => {
          if (event.error) {
            this.paymentError = event.error.message;
          } else {
            this.paymentError = '';
          }
        });
      } else {
        console.error('Card element container not found');
      }
    }
  }

  async handlePayment() {
    if (!this.stripe || !this.cardElementInstance) {
      this.paymentError = 'Stripe has not been initialized';
      return;
    }

    if (!this.customerName || !this.customerEmail) {
      this.paymentError = 'Please fill in all required fields';
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';
    this.paymentSuccess = false;

    try {
      // Step 1: Create Payment Intent on the server
      const amountInCents = Math.round(this.amount * 100);
      const metadata = {
        customerName: this.customerName,
        customerEmail: this.customerEmail
      };

      const paymentIntentResponse = await this.paymentService
        .createPaymentIntent(amountInCents, this.currency, metadata)
        .toPromise();

      if (!paymentIntentResponse) {
        throw new Error('Failed to create payment intent');
      }

      this.clientSecret = paymentIntentResponse.clientSecret;
      this.paymentIntentId = paymentIntentResponse.paymentIntentId;

      // Step 2: Confirm the payment with Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        this.clientSecret,
        {
          payment_method: {
            card: this.cardElementInstance,
            billing_details: {
              name: this.customerName,
              email: this.customerEmail
            }
          }
        }
      );

      if (error) {
        // Payment failed
        this.paymentError = error.message || 'Payment failed';
        this.isProcessing = false;
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        this.paymentSuccess = true;
        this.isProcessing = false;

        // Optional: Confirm on server
        this.paymentService.confirmPayment(paymentIntent.id).subscribe({
          next: (confirmation) => {
            console.log('Payment confirmed on server:', confirmation);
          },
          error: (err) => {
            console.error('Server confirmation error:', err);
          }
        });

        // Clear the form
        this.resetForm();
      }
    } catch (error: any) {
      this.paymentError = error.message || 'An unexpected error occurred';
      this.isProcessing = false;
    }
  }

  resetForm() {
    this.customerName = '';
    this.customerEmail = '';
    this.amount = 50.00;
    
    if (this.cardElementInstance) {
      this.cardElementInstance.clear();
    }
  }

  resetPaymentStatus() {
    this.paymentSuccess = false;
    this.paymentError = '';
  }
}
