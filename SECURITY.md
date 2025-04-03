# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within EduFlow, please send an email to security@example.com. All security vulnerabilities will be promptly addressed.

## Environment Variables

EduFlow uses environment variables to store sensitive configuration data. Never commit real credentials to version control.

### Setting Up Environment Variables

1. Copy `.env.example` to `.env` in both client and server directories
2. Fill in your own values for all variables

```bash
# Server directory
cp server/.env.example server/.env

# Client directory
cp client/.env.example client/.env
```

### Critical Environment Variables

The following environment variables contain sensitive information and must be properly secured:

#### Server

- `MONGO_URI`: MongoDB connection string with username and password
- `JWT_SECRET` and `REFRESH_TOKEN_SECRET`: Used for authentication
- `API_KEY` and `API_SECRET`: Cloudinary credentials
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Payment gateway credentials

#### Client

- `VITE_API_URL`: While not a secret, should be set correctly for production environments

## Secure Practices

1. **Use Strong Passwords**: All API keys and secrets should be strong, unique passwords
2. **Restrict API Access**: Limit API credentials to only the permissions they need
3. **Regularly Rotate Credentials**: Change API keys periodically
4. **Environment Isolation**: Use different API keys for development and production
5. **IP Restrictions**: When possible, restrict API access to specific IP addresses

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production` in server environment
2. Use HTTPS for all communication
3. Implement rate limiting and request throttling
4. Regularly update all dependencies
5. Configure proper CORS settings

## Third-Party Services

### MongoDB

- Use IP allowlisting to restrict database access
- Create database users with minimal required permissions
- Enable database auditing for production environments

### Cloudinary

- Set up upload presets with transformation limits
- Use signed uploads for authenticated users
- Implement proper access control for media assets

### Razorpay

- Use webhooks with signature verification
- Implement idempotency to prevent duplicate transactions
- Test thoroughly in sandbox mode before going live 