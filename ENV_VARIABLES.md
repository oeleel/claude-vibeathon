# Environment Variables Configuration

This document outlines all environment variables needed for deployment.

## Server Environment Variables

Create a `.env` file in the `server/` directory for local development:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
# Local: http://localhost:5173
# Production: https://your-frontend-url.onrender.com or your custom domain
CLIENT_URL=http://localhost:5173
```

### For Render Deployment (Backend Service)

Set these in the Render Dashboard under your backend service's Environment tab:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `NODE_ENV` | `production` | Set Node.js environment |
| `PORT` | `3001` | Server port (auto-assigned by Render) |
| `CLIENT_URL` | `https://korean-kitchen-party-web.onrender.com` | Your frontend URL |

**Important:** After deploying the frontend, update `CLIENT_URL` with the actual frontend URL.

## Client Environment Variables

Create a `.env` file in the `client/` directory for local development:

```bash
# Backend API URL
# Local: http://localhost:3001
# Production: https://your-backend-url.onrender.com
VITE_API_URL=http://localhost:3001
```

### For Render Deployment (Frontend Service)

Set these in the Render Dashboard under your frontend service's Environment tab:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `VITE_API_URL` | `https://korean-kitchen-party-api.onrender.com` | Your backend API URL |

**Important:** After deploying the backend, update `VITE_API_URL` with the actual backend URL.

## Local Development Setup

1. **Create server `.env` file:**
   ```bash
   cd server
   cat > .env << EOF
   PORT=3001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   EOF
   ```

2. **Create client `.env` file:**
   ```bash
   cd client
   cat > .env << EOF
   VITE_API_URL=http://localhost:3001
   EOF
   ```

3. **Start both services:**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

## Production Deployment Checklist

- [ ] Deploy backend service to Render
- [ ] Copy backend URL (e.g., `https://korean-kitchen-party-api.onrender.com`)
- [ ] Set `VITE_API_URL` in frontend service to backend URL
- [ ] Deploy/rebuild frontend service
- [ ] Copy frontend URL (e.g., `https://korean-kitchen-party-web.onrender.com`)
- [ ] Set `CLIENT_URL` in backend service to frontend URL
- [ ] Restart backend service
- [ ] Test connection by creating and joining a room
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Update environment variables with custom domain URLs

## Custom Domain Configuration

If using a custom domain (e.g., `koreankirchen.party`):

1. Add custom domain in Render Dashboard (Settings → Custom Domains)
2. Update DNS records at your domain registrar
3. Wait for SSL certificate provisioning
4. Update environment variables:

**Backend:**
```
CLIENT_URL=https://koreankirchen.party
```

**Frontend:**
```
VITE_API_URL=https://api.koreankirchen.party
```

(If using subdomain for API)

## Security Notes

- ⚠️ Never commit `.env` files to Git (already in `.gitignore`)
- ⚠️ Keep environment variables secure in Render Dashboard
- ⚠️ Don't use `*` for CORS in production
- ✅ Always use `https://` for production URLs
- ✅ Keep `CLIENT_URL` restricted to your frontend domain only

## Troubleshooting

### CORS Errors
- Verify `CLIENT_URL` matches your frontend URL exactly (including https://)
- Make sure there's no trailing slash
- Restart the backend service after changing environment variables

### Connection Errors
- Verify `VITE_API_URL` is correct
- Check that backend service is running (not sleeping)
- Open browser console and check for specific error messages
- Test backend health: `curl https://your-backend-url.onrender.com/health`

### Build Errors
- Ensure all environment variables are set before building
- For Vite, environment variables must start with `VITE_`
- Verify Node.js version compatibility (18+ recommended)

