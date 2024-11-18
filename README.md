# Apigee Deployment Manager

A comprehensive tool for managing Apigee proxy deployments through both web and desktop interfaces.

## Features

- Web-based deployment interface
- Desktop application for local deployments
- Multi-environment support
- Deployment history and tracking
- Real-time deployment status updates
- Revision management
- Google Cloud authentication
- Role-based access control

## Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Google Cloud Project with Apigee API enabled
- Google Cloud Service Account with appropriate permissions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/apigee-deployment-manager.git
cd apigee-deployment-manager
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
JWT_SECRET=your-secret-key

# Google Cloud Configuration
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Apigee Configuration
APIGEE_ORG=your-org
APIGEE_ORG_PROD=your-prod-org
```

4. Start the development servers:
```bash
# Start backend server
npm run start:server

# Start web application
npm run start:web

# Start desktop application
npm run start:desktop
```

## Project Structure

```
apigee-deployment-manager/
├── web/               # Web application
├── desktop/           # Desktop application
├── server/            # Backend server
└── shared/           # Shared utilities and types
```

## Usage

### Web Interface

1. Navigate to `http://localhost:3000`
2. Log in with your Google account
3. Configure your deployment settings
4. Upload and deploy your Apigee proxy

### Desktop Application

1. Launch the desktop application
2. Configure your API credentials in Settings
3. Select your proxy bundle and deployment environment
4. Deploy and monitor the deployment progress

## Deployment Process

1. **Authentication**
   - Authenticate with Google Cloud
   - Verify organization access

2. **Validation**
   - Validate proxy bundle
   - Check environment permissions
   - Verify configuration

3. **Deployment**
   - Upload proxy bundle
   - Create new revision
   - Deploy to target environment
   - Monitor deployment status

4. **Verification**
   - Verify deployment success
   - Check proxy status
   - Generate deployment report

## Security

- JWT-based authentication
- Role-based access control
- Secure credential storage
- API token rotation
- Audit logging

## Development

### Building

```bash
# Build all components
npm run build:all

# Build specific components
npm run build:web
npm run build:desktop
npm run build:server
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:server
npm run test:e2e
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**
   - Verify Google Cloud credentials
   - Check token expiration
   - Validate organization access

2. **Deployment Failures**
   - Check proxy bundle format
   - Verify environment access
   - Review deployment logs

3. **Connection Issues**
   - Verify network connectivity
   - Check API endpoints
   - Validate proxy settings

## Support

For support, please:

1. Check the documentation
2. Review troubleshooting guide
3. Open an issue on GitHub
4. Contact support team

## License

MIT License - see LICENSE.md for details
