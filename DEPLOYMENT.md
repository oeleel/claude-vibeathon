# Deployment Guide - Korean Kitchen Party

This guide will walk you through deploying the Korean Kitchen Party game to Render's free tier with custom domain support.

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Your custom domain (if using one)
- Code pushed to a GitHub repository

## Quick Start

### 1. Push Your Code to GitHub

```bash
# If not already initialized
git init
git add .
git commit -m "Prepare for deployment"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Render

#### Option A: Using Blueprint (Recommended - Automated)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Configure environment variables (see below)
6. Click "Apply" to deploy both services

#### Option B: Manual Deployment (If Blueprint fails)

**Deploy Backend (API Server):**

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name:** `korean-kitchen-party-api`
   - **Region:** Oregon (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free
4. Add Environment Variables (see below)
5. Click "Create Web Service"

**Deploy Frontend (React App):**

1. Go to Render Dashboard → "New" → "Static Site"
2. Connect your GitHub repo
3. Configure:
   - **Name:** `korean-kitchen-party-web`
   - **Region:** Oregon
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`
4. Add Environment Variables (see below)
5. Click "Create Static Site"

### 3. Configure Environment Variables

#### Backend Service Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets Node to production mode |
| `PORT` | `3001` | Server port (auto-assigned by Render) |
| `CLIENT_URL` | `https://your-frontend-url.onrender.com` | Your frontend URL for CORS |

**Note:** After deploying the frontend, copy its URL and set it as `CLIENT_URL` in the backend environment variables.

#### Frontend Service Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` | Your backend API URL |

**Note:** After deploying the backend, copy its URL and set it as `VITE_API_URL` in the frontend environment variables.

### 4. Update Environment Variables After Initial Deployment

This is important! The services need to know each other's URLs:

1. **After Backend Deploys:**
   - Copy the backend URL (e.g., `https://korean-kitchen-party-api.onrender.com`)
   - Go to Frontend service → Environment
   - Set `VITE_API_URL` to the backend URL
   - Click "Save Changes" (this will trigger a rebuild)

2. **After Frontend Deploys:**
   - Copy the frontend URL (e.g., `https://korean-kitchen-party-web.onrender.com`)
   - Go to Backend service → Environment
   - Set `CLIENT_URL` to the frontend URL
   - Click "Save Changes" (this will trigger a restart)

### 5. Configure Custom Domain (Optional)

#### For Frontend (Static Site):

1. Go to your frontend service in Render Dashboard
2. Click "Settings" → "Custom Domains"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `koreankirchen.party` or `www.koreankirchen.party`)
5. Render will provide DNS records (CNAME or A records)
6. Add these records in your domain registrar's DNS settings:
   - **Type:** CNAME
   - **Name:** @ (for root domain) or www
   - **Value:** The Render URL provided
7. Wait for DNS propagation (5 minutes to 48 hours)
8. SSL certificate will be auto-provisioned by Render

#### Update Environment Variables After Custom Domain:

After your custom domain is active:
1. Update backend `CLIENT_URL` to your custom domain
2. Click "Save Changes" to restart the backend

Example:
```
CLIENT_URL=https://koreankirchen.party
```

## Verification

### Test Your Deployment

1. **Visit Your Frontend URL**
   - Should load the homepage
   - Check browser console for errors

2. **Create a Room**
   - Click "Create Room"
   - Should generate a room code

3. **Join from Another Device**
   - Open the URL on your phone or another computer
   - Join the room using the code
   - Verify both players can see each other

4. **Test Multiplayer Gameplay**
   - Start a game
   - Verify ingredients appear
   - Test dragging ingredients to edges to pass
   - Test combining ingredients
   - Test serving dishes

## Troubleshooting

### Issue: "Failed to connect to server"

**Solution:**
- Check that `VITE_API_URL` in frontend matches your backend URL
- Verify backend service is running (not sleeping)
- Check browser console for CORS errors

### Issue: CORS errors in browser console

**Solution:**
- Verify `CLIENT_URL` in backend matches your frontend URL exactly
- Make sure to include `https://` in the URLs
- Check that both services have restarted after environment variable changes

### Issue: "404 Not Found" on page refresh

**Solution:**
- For static sites, this is handled by the `routes` configuration in `render.yaml`
- Verify the frontend service has the rewrite rule configured

### Issue: Services keep sleeping (Free tier)

**Note:** Render's free tier will spin down services after inactivity
- Services wake up automatically when accessed (30-60 second delay)
- Consider upgrading to a paid plan for always-on services
- Or use a service like UptimeRobot to ping your app every 14 minutes

### Issue: WebSocket connection fails

**Solution:**
- Ensure you're using `wss://` (not `ws://`) for production
- Verify Socket.io transports are set to `['websocket']`
- Check that the backend URL doesn't have a trailing slash

### Issue: Build fails on Render

**Solution:**
- Check the build logs in Render Dashboard
- Verify all dependencies are in `package.json`
- Make sure Node version is compatible (14+ required)
- Try adding a `.node-version` file with `18` if needed

## Monitoring

### View Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor real-time logs for errors

### Check Service Health

Backend health endpoint: `https://your-backend-url.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Performance Tips

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- 750 hours/month across all free services
- Limited bandwidth

### Optimization
- Minimize asset sizes
- Enable browser caching
- Consider upgrading to paid plan for better performance

## Security

### Environment Variables
- Never commit `.env` files to Git
- Use Render's environment variable management
- Rotate secrets if exposed

### CORS
- Keep `CLIENT_URL` restricted to your frontend domain only
- Don't use `*` for production CORS

## Updates and Redeployment

### Automatic Deploys
Render automatically redeploys when you push to your GitHub repository.

### Manual Redeploy
1. Go to Render Dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

## Cost Estimate

### Free Tier
- Backend: Free (750 hours/month)
- Frontend: Free
- Custom Domain: Free SSL included
- **Total: $0/month**

### Paid Tier (If needed)
- Starter: $7/month per service
- Standard: $25/month per service
- Pro: $85/month per service

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- GitHub Issues: Report bugs in your repository

## Next Steps

1. Share your game URL with friends!
2. Monitor usage and performance
3. Gather feedback and iterate
4. Consider adding:
   - Analytics
   - User accounts
   - Leaderboards
   - Additional Korean recipes

---

**Congratulations!** 🎉 Your Korean Kitchen Party game is now live and accessible to players worldwide!

