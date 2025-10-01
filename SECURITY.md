# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Lia team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:
- **Email**: security@lia.dev
- **Subject**: [SECURITY] Brief description

### What to Include

Please include the following information:

1. **Type of issue** (e.g., SQL injection, XSS, authentication bypass)
2. **Full paths** of source file(s) related to the issue
3. **Location** of the affected source code (tag/branch/commit or direct URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if possible)
6. **Impact** of the issue, including how an attacker might exploit it
7. **Any potential mitigations** you've identified

### Response Timeline

- **Initial Response**: Within 48 hours
- **Confirmation**: Within 7 days
- **Fix Development**: Depends on severity
- **Public Disclosure**: After fix is released (coordinated with reporter)

### What to Expect

1. **Acknowledgment**: We'll acknowledge your email within 48 hours
2. **Updates**: Regular updates on the progress of your report
3. **Disclosure**: Coordinated disclosure after the fix is released
4. **Credit**: Public acknowledgment of your responsible disclosure (if desired)

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version of Lia
2. **Strong Secrets**: Use strong, randomly generated secrets for JWT and sessions
3. **HTTPS**: Always use HTTPS in production
4. **Database Security**: Secure your database with strong passwords and restricted access
5. **Regular Backups**: Maintain regular backups of your data
6. **API Keys**: Keep API keys secure and rotate them regularly
7. **Updates**: Subscribe to security announcements

### For Self-Hosting

1. **Environment Variables**: Never commit `.env` files or expose secrets
2. **Database**: Use strong passwords and limit network access
3. **Reverse Proxy**: Use Nginx or similar with proper security headers
4. **Firewall**: Configure firewall rules to limit access
5. **Monitoring**: Implement logging and monitoring for suspicious activity
6. **Updates**: Set up automatic security updates for the OS

### Security Headers

Recommended security headers for your reverse proxy:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Known Security Considerations

### Data Storage

- User content is stored as provided
- Implement proper access controls
- Consider encryption at rest for sensitive data

### API Authentication

- JWT tokens are used for authentication
- Tokens expire based on configuration
- Refresh tokens are not yet implemented

### Third-Party Services

- OpenAI API key is required for AI features
- Consider using environment-specific keys
- Monitor API usage for anomalies

## Security Features

### Current

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Role-based access control

### Planned

- 🔄 Two-factor authentication (2FA)
- 🔄 Refresh tokens
- 🔄 Security audit logging
- 🔄 Advanced rate limiting
- 🔄 IP whitelisting
- 🔄 Encrypted backups

## Vulnerability Disclosure Policy

We believe in responsible disclosure and follow these principles:

1. **Grace Period**: We ask for a 90-day grace period before public disclosure
2. **Coordination**: We'll work with you to understand and resolve the issue
3. **Credit**: We'll publicly credit you for the discovery (if desired)
4. **Bug Bounty**: While we don't currently have a formal program, we appreciate all reports

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed:

1. **Critical**: Within 24-48 hours
2. **High**: Within 1 week
3. **Medium**: Within 2 weeks
4. **Low**: In next regular release

## Contact

- **Security Email**: security@lia.dev
- **General Contact**: hello@lia.dev
- **Discord**: https://discord.gg/lia

## PGP Key

For encrypted communications, use our PGP key:

```
[PGP KEY WOULD GO HERE]
```

---

Thank you for helping keep Lia and its users safe!
