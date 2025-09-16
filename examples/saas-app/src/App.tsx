import React, { useState } from 'react';
// @ts-ignore
import { BrolostackProvider, useBrolostackStore, useBrolostackState } from '../../src/react/BrolostackProvider';
import './App.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'trial' | 'active' | 'inactive';
  signupDate: string;
  lastLogin: string;
  monthlySpend: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  id: string;
  customerId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  amount: number;
  billingCycle: string;
  createdAt: string;
}

const CustomerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    plan: 'basic' as const,
    status: 'trial' as const,
    monthlySpend: 0,
    notes: ''
  });

  const customersStore = useBrolostackStore('customers');
  const subscriptionsStore = useBrolostackStore('subscriptions');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim()) {
      const customer = customersStore.addCustomer(formData);
      
      // Create initial subscription
      subscriptionsStore.addSubscription({
        customerId: customer.id,
        plan: formData.plan,
        status: formData.status,
        amount: formData.monthlySpend,
        billingCycle: 'monthly'
      });
      
      setFormData({
        name: '',
        email: '',
        company: '',
        plan: 'basic',
        status: 'trial',
        monthlySpend: 0,
        notes: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Customer Name</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="plan">Plan</label>
        <select
          id="plan"
          value={formData.plan}
          onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
        >
          <option value="basic">Basic - $29/month</option>
          <option value="pro">Pro - $99/month</option>
          <option value="enterprise">Enterprise - $299/month</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
        >
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="monthlySpend">Monthly Spend ($)</label>
        <input
          type="number"
          id="monthlySpend"
          value={formData.monthlySpend}
          onChange={(e) => setFormData({ ...formData, monthlySpend: Number(e.target.value) })}
          min="0"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      
      <button type="submit" className="btn">Add Customer</button>
    </form>
  );
};

const CustomerList: React.FC = () => {
  const customersStore = useBrolostackStore('customers');
  const customers = useBrolostackState('customers', (state: any) => state.customers);
  const filters = useBrolostackState('customers', (state: any) => state.filters);

  const filteredCustomers = customers.filter((customer: Customer) => {
    if (filters.plan !== 'all' && customer.plan !== filters.plan) return false;
    if (filters.status !== 'all' && customer.status !== filters.status) return false;
    return true;
  });

  const updateCustomerStatus = (id: string, status: string) => {
    customersStore.updateCustomer(id, { status });
  };

  const deleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      customersStore.deleteCustomer(id);
    }
  };

  if (filteredCustomers.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Customers</h3>
        <p>Start by adding your first customer!</p>
      </div>
    );
  }

  return (
    <div className="customer-list">
      {filteredCustomers.map((customer: Customer) => (
        <div key={customer.id} className="customer-item">
          <div className="customer-header">
            <h3 className="customer-name">{customer.name}</h3>
            <span className={`customer-plan plan-${customer.plan}`}>
              {customer.plan}
            </span>
          </div>
          
          <div className="customer-email">{customer.email}</div>
          
          <div className="customer-meta">
            <span>Company: {customer.company || 'N/A'}</span>
            <span className={`status-${customer.status}`}>
              Status: {customer.status}
            </span>
            <span>Spend: ${customer.monthlySpend}/month</span>
          </div>
          
          {customer.notes && (
            <div style={{ marginBottom: '1rem', color: '#666' }}>
              {customer.notes}
            </div>
          )}
          
          <div className="customer-actions">
            <select
              value={customer.status}
              onChange={(e) => updateCustomerStatus(customer.id, e.target.value)}
              className="btn btn-sm"
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => deleteCustomer(customer.id)}
              className="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const customers = useBrolostackState('customers', (state: any) => state.customers);
  const subscriptions = useBrolostackState('subscriptions', (state: any) => state.subscriptions);
  const revenue = useBrolostackState('subscriptions', (state: any) => state.revenue);

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c: Customer) => c.status === 'active').length,
    trialCustomers: customers.filter((c: Customer) => c.status === 'trial').length,
    monthlyRevenue: revenue
  };

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-icon">👥</div>
          <h3 className="card-title">Total Customers</h3>
        </div>
        <div className="card-value">{stats.totalCustomers}</div>
        <div className="card-subtitle">All time customers</div>
      </div>
      
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-icon">✅</div>
          <h3 className="card-title">Active Customers</h3>
        </div>
        <div className="card-value">{stats.activeCustomers}</div>
        <div className="card-subtitle">Currently paying</div>
      </div>
      
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-icon">💰</div>
          <h3 className="card-title">Monthly Revenue</h3>
        </div>
        <div className="card-value">${stats.monthlyRevenue}</div>
        <div className="card-subtitle">Recurring revenue</div>
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const customers = useBrolostackState('customers', (state: any) => state.customers);
  const subscriptions = useBrolostackState('subscriptions', (state: any) => state.subscriptions);

  const analytics = {
    conversionRate: customers.length > 0 ? 
      ((customers.filter((c: Customer) => c.status === 'active').length / customers.length) * 100).toFixed(1) : 0,
    avgRevenuePerCustomer: customers.length > 0 ? 
      (subscriptions.reduce((sum: number, s: Subscription) => sum + s.amount, 0) / customers.length).toFixed(2) : 0,
    churnRate: '2.5%', // Mock data
    growthRate: '+15.3%' // Mock data
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Analytics</h2>
      </div>
      <div className="section-content">
        <div className="revenue-chart">
          📊 Revenue Chart (Mock Data)
        </div>
        
        <div className="analytics-grid">
          <div className="analytics-item">
            <div className="analytics-value">{analytics.conversionRate}%</div>
            <div className="analytics-label">Conversion Rate</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-value">${analytics.avgRevenuePerCustomer}</div>
            <div className="analytics-label">Avg Revenue/Customer</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-value">{analytics.churnRate}</div>
            <div className="analytics-label">Churn Rate</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-value">{analytics.growthRate}</div>
            <div className="analytics-label">Growth Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrolostackProvider appName="saas-app" config={{}}>
      <div className="app">
        <header className="header">
          <h1>🚀 SaaS Dashboard</h1>
          <p>Manage your SaaS business with Brolostack</p>
        </header>

        <Dashboard />

        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Customer Management</h2>
            </div>
            <div className="section-content">
              <CustomerForm />
            </div>
          </div>

          <Analytics />
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Customers</h2>
          </div>
          <div className="section-content">
            <CustomerList />
          </div>
        </div>
      </div>
    </BrolostackProvider>
  );
};

export default App;
