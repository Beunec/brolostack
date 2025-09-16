# Security Policy

## Supported Versions

We actively support the following versions of Brolostack with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Brolostack, please report it responsibly:

### 🚨 **DO NOT** create a public GitHub issue for security vulnerabilities.

### 📧 **How to Report**

1. **Email**: Send details to `contact@beunec.com`
2. **Subject**: `[SECURITY] Brolostack Vulnerability Report`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### ⏱️ **Response Timeline**

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Resolution**: Within 30 days (depending on severity)

### 🛡️ **Security Best Practices**

When using Brolostack:

- Keep your dependencies updated
- Use HTTPS in production
- Implement proper input validation
- Follow browser security guidelines
- Regularly audit your application code

### 📋 **Security Considerations**

Brolostack operates primarily in the browser environment:

- **Client-side Storage**: Data is stored locally in the user's browser
- **No Server Dependencies**: Reduces server-side attack vectors
- **Encryption**: Implement additional encryption for sensitive data
- **CORS**: Configure CORS policies appropriately for cloud integrations

### 🔒 **Data Privacy**

- Brolostack does not collect or transmit user data by default
- All data remains in the user's local browser storage
- Cloud integrations are optional and user-controlled
- Review privacy implications of any cloud adapters you implement

---

**Security Team**: Beunec Technologies, Inc.  
**Contact**: security@beunec.com  
**Last Updated**: September 2025
