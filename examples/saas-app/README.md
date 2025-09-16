# SaaS App - Brolostack Example

A comprehensive Software-as-a-Service (SaaS) management dashboard built with Brolostack.

## Features

- **Customer Management**: Add, update, and track customer information
- **Subscription Management**: Handle different subscription plans and billing
- **Revenue Tracking**: Monitor monthly recurring revenue (MRR)
- **Analytics Dashboard**: View key business metrics and KPIs
- **Plan Management**: Support for Basic, Pro, and Enterprise plans
- **Status Tracking**: Monitor customer lifecycle from trial to active
- **Company Information**: Track customer company details and notes

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the example directory:
   ```bash
   cd examples/saas-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3004`

## Usage

### Adding Customers

1. Fill out the customer form with:
   - Customer name
   - Email address
   - Company name
   - Subscription plan (Basic/Pro/Enterprise)
   - Status (Trial/Active/Inactive)
   - Monthly spend amount
   - Notes (optional)

2. Click "Add Customer" to save

### Managing Customers

- **Update Status**: Use the dropdown to change customer status
- **Delete Customers**: Click the delete button to remove customers
- **View Analytics**: Check the dashboard for business metrics

### Subscription Plans

- **Basic**: $29/month - Entry-level features
- **Pro**: $99/month - Advanced features and support
- **Enterprise**: $299/month - Full feature set with premium support

### Customer Statuses

- **Trial**: New customers in trial period
- **Active**: Paying customers with active subscriptions
- **Inactive**: Customers who have cancelled or paused

### Analytics Dashboard

The dashboard provides key business metrics:

- **Total Customers**: All-time customer count
- **Active Customers**: Currently paying customers
- **Monthly Revenue**: Total recurring revenue
- **Conversion Rate**: Trial to paid conversion percentage
- **Average Revenue per Customer**: ARPU calculation
- **Churn Rate**: Customer cancellation rate
- **Growth Rate**: Month-over-month growth

## Data Persistence

All data is stored locally in your browser using Brolostack's built-in storage system. Your customer data will persist between sessions and remain private on your device.

## Built With

- **Brolostack**: Zero-cost full-stack framework
- **React**: User interface library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

## Example Use Cases

- **SaaS Startups**: Manage early-stage customer base
- **Freelance Services**: Track client subscriptions and billing
- **Digital Products**: Monitor course or software sales
- **Consulting Services**: Organize client relationships and contracts
- **API Services**: Track API usage and subscription tiers

## Business Logic

The app demonstrates common SaaS business patterns:

- **Customer Lifecycle**: From trial signup to active subscription
- **Revenue Tracking**: Monthly recurring revenue calculation
- **Plan Management**: Tiered pricing structure
- **Analytics**: Key performance indicators for SaaS businesses

## Customization

The app can be easily customized by modifying:

- `src/App.tsx`: Main application logic and components
- `src/App.css`: Styling and visual design
- `src/main.tsx`: Brolostack configuration and store setup

## Scaling Considerations

While this example uses local storage, in a production SaaS environment, you might want to:

- Integrate with payment processors (Stripe, PayPal)
- Add user authentication and authorization
- Implement real-time notifications
- Connect to external analytics services
- Add customer support features

## License

MIT License - see the main Brolostack repository for details.
