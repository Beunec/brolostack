import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// @ts-ignore
import { Brolostack } from '../../src/core/Brolostack';

// Initialize Brolostack for SaaS app
const app = new Brolostack({
  appName: 'saas-app',
  version: '1.0.0',
  storage: {
    version: 1,
    size: 100 * 1024 * 1024, // 100MB
    storeName: 'saas-data'
  }
});

// Create customers store
const customersStore = app.createStore('customers', {
  customers: [],
  currentCustomer: null,
  filters: {
    plan: 'all',
    status: 'all'
  }
});

// Create subscriptions store
const subscriptionsStore = app.createStore('subscriptions', {
  subscriptions: [],
  currentSubscription: null,
  revenue: 0
});

// Create analytics store
const analyticsStore = app.createStore('analytics', {
  metrics: {
    totalCustomers: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    growthRate: 0
  },
  chartData: []
});

// Add customer methods
customersStore.addMethod('addCustomer', (customerData: any) => {
  const customer = {
    id: Date.now().toString(),
    name: customerData.name,
    email: customerData.email,
    company: customerData.company,
    plan: customerData.plan || 'basic',
    status: customerData.status || 'trial',
    signupDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    monthlySpend: customerData.monthlySpend || 0,
    notes: customerData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  customersStore.setState((state: any) => ({
    ...state,
    customers: [...state.customers, customer]
  }));
  
  // Update analytics
  analyticsStore.setState((state: any) => ({
    ...state,
    metrics: {
      ...state.metrics,
      totalCustomers: state.metrics.totalCustomers + 1
    }
  }));
  
  return customer;
});

customersStore.addMethod('updateCustomer', (id: any, updates: any) => {
  customersStore.setState((state: any) => ({
    ...state,
    customers: state.customers.map((customer: any) => 
      customer.id === id 
        ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
        : customer
    )
  }));
});

customersStore.addMethod('deleteCustomer', (id: any) => {
  customersStore.setState((state: any) => ({
    ...state,
    customers: state.customers.filter((customer: any) => customer.id !== id)
  }));
  
  // Update analytics
  analyticsStore.setState((state: any) => ({
    ...state,
    metrics: {
      ...state.metrics,
      totalCustomers: Math.max(0, state.metrics.totalCustomers - 1)
    }
  }));
});

customersStore.addMethod('setCurrentCustomer', (customer: any) => {
  customersStore.setState((state: any) => ({
    ...state,
    currentCustomer: customer
  }));
});

// Add subscription methods
subscriptionsStore.addMethod('addSubscription', (subscriptionData: any) => {
  const subscription = {
    id: Date.now().toString(),
    customerId: subscriptionData.customerId,
    plan: subscriptionData.plan,
    status: subscriptionData.status || 'active',
    startDate: new Date().toISOString(),
    endDate: subscriptionData.endDate,
    amount: subscriptionData.amount,
    billingCycle: subscriptionData.billingCycle || 'monthly',
    createdAt: new Date().toISOString()
  };
  
  subscriptionsStore.setState((state: any) => ({
    ...state,
    subscriptions: [...state.subscriptions, subscription]
  }));
  
  // Update revenue
  subscriptionsStore.setState((state: any) => ({
    ...state,
    revenue: state.revenue + subscription.amount
  }));
  
  return subscription;
});

subscriptionsStore.addMethod('updateSubscription', (id: any, updates: any) => {
  subscriptionsStore.setState((state: any) => ({
    ...state,
    subscriptions: state.subscriptions.map((subscription: any) => 
      subscription.id === id 
        ? { ...subscription, ...updates }
        : subscription
    )
  }));
});

subscriptionsStore.addMethod('cancelSubscription', (id: any) => {
  subscriptionsStore.setState((state: any) => ({
    ...state,
    subscriptions: state.subscriptions.map((subscription: any) => 
      subscription.id === id 
        ? { ...subscription, status: 'cancelled' }
        : subscription
    )
  }));
});

// Add analytics methods
analyticsStore.addMethod('updateMetrics', (metrics: any) => {
  analyticsStore.setState((state: any) => ({
    ...state,
    metrics: { ...state.metrics, ...metrics }
  }));
});

analyticsStore.addMethod('addChartData', (dataPoint: any) => {
  analyticsStore.setState((state: any) => ({
    ...state,
    chartData: [...state.chartData, dataPoint]
  }));
});

// Persist stores
customersStore.persist();
subscriptionsStore.persist();
analyticsStore.persist();

// Make stores available globally for the app
(window as any).customersStore = customersStore;
(window as any).subscriptionsStore = subscriptionsStore;
(window as any).analyticsStore = analyticsStore;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);
