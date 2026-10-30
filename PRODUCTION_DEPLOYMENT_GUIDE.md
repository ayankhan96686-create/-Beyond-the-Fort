# BEYOND THE FORT — PRODUCTION CLOUD DEPLOYMENT GUIDE
## Comprehensive Cloud Architecture & Deployment Playbook

**Project:** Time-Aware Digital Discoverability — Beyond the Fort, Gwalior  
**Team:** Team Venator (ID: 60358412) — AI Synergy Hackathon 2026  
**Last Updated:** October 30, 2026  
**Application Architecture:** Dual-Runtime Container (Node.js 20 LTS Express REST API + Python 3.11 LangGraph 6-Agent Engine)

---

## 1. Cloud Provider Comparison Matrix

| Evaluation Criteria | Option A: Render | Option B: Railway | Option C: AWS EC2 / DigitalOcean (PM2 + Nginx) |
| :--- | :--- | :--- | :--- |
| **Best Suited For** | Hackathon evaluation, zero-DevOps public demo | Fast CI/CD team staging & preview environments | Enterprise production, custom domains, high volume |
| **Deployment Mechanism** | Native Docker Blueprint (`render.yaml`) | Automated Git Build (`Dockerfile`) | Bare-metal / VM (`ecosystem.config.js` + `nginx.conf`) |
| **Setup Complexity** | ⭐ (5 minutes) | ⭐⭐ (8 minutes) | ⭐⭐⭐⭐ (30 minutes) |
| **Dual Runtime Support** | Seamless via unified `Dockerfile` | Seamless via unified `Dockerfile` | Native via PM2 process manager |
| **SSL / TLS Termination** | Automated via Cloudflare/Let's Encrypt | Automated via Cloudflare/Let's Encrypt | Manual / Certbot (`nginx.conf`) |
| **Zero Hardcoded Localhost** | Fully verified; uses `PORT` & `APP_PUBLIC_URL` | Fully verified; uses `PORT` & `APP_PUBLIC_URL` | Fully verified; reverse-proxied via Nginx upstream |
| **Health Check Endpoint** | `/ready` probe (HTTP 200) | `/ready` probe (HTTP 200) | `/ready` probe + systemd watchdog |
| **Cost Profile** | Free tier / \$7/mo Starter Web Service | Usage-based (\$5 credit free, then \$5/mo) | \$5-\$10/mo fixed compute |

---

## 2. Mandatory Production Environment Variables

Prior to initiating any cloud deployment, configure these environment variables in your provider's dashboard:

```env
# Application Runtime
NODE_ENV=production
PORT=3000
TRUST_PROXY_HOPS=1
APP_PUBLIC_URL=https://your-app-domain.com

# Gemini AI Engine
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tourism_gwalior?retryWrites=true&w=majority

# Routing & Transit Provider
ROUTING_PROVIDER_URL=https://api.mapbox.com
ROUTING_PROVIDER_API_KEY=your_mapbox_access_token_here
ROUTING_PROVIDER_TIMEOUT_SECONDS=5

# Inter-Service Security
LANGGRAPH_SERVICE_TOKEN=your_secure_32_character_token_here

# Provider-Independent SMTP (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM="Beyond the Fort <notifications@yourdomain.com>"
```

> [!IMPORTANT]
> If SMTP credentials are not yet configured in production, the application fails gracefully: `/api/auth/forgot-password` returns HTTP 503 `EMAIL_NOT_CONFIGURED` without crashing or falsely claiming that emails were sent.

---

## 3. Option A: Step-by-Step Render Deployment (Recommended)

Render offers the fastest, most reliable deployment for Beyond the Fort using our pre-configured `render.yaml` blueprint.

### Step 1: Connect GitHub Repository
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprints**.
3. Select your connected GitHub repository: `ayankhan96686-create/-Beyond-the-Fort`.
4. Render will automatically detect `render.yaml` in the root directory.

### Step 2: Configure Secret Environment Variables
In the Render Blueprint configuration screen, input the non-committed secrets:
- `GEMINI_API_KEY`
- `MONGODB_URI`
- `ROUTING_PROVIDER_API_KEY`
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`
- `APP_PUBLIC_URL` (Set to `https://beyond-the-fort.onrender.com` or your custom domain)

### Step 3: Deploy & Verify
1. Click **Apply**.
2. Render builds the Docker image from `Dockerfile`:
   - Installs Python 3.11 and dependencies in `.venv`.
   - Installs Node.js production dependencies via `npm ci --omit=dev`.
   - Starts the unified orchestrator `scripts/start-all.js`.
3. Render monitors the `/ready` health check until the container reports healthy status.

---

## 4. Option B: Step-by-Step Railway Deployment

Railway provides high-speed container deployment directly from GitHub.

1. Navigate to [Railway](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo** and pick `ayankhan96686-create/-Beyond-the-Fort`.
3. Under **Settings**:
   - Set **Build Type** to `Dockerfile`.
   - Set **Healthcheck Path** to `/ready`.
4. Under **Variables**, add all required production environment variables.
5. Under **Networking**, click **Generate Domain** to receive your public HTTPS URL.
6. Set `APP_PUBLIC_URL` to your generated Railway domain.

---

## 5. Option C: AWS EC2 / DigitalOcean Ubuntu Deployment (PM2 + Nginx)

For full infrastructure ownership and high-traffic deployments:

### Step 1: Provision Server & Install Runtimes
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm python3 python3-pip python3-venv nginx git certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Clone & Configure Codebase
```bash
cd /var/www
git clone https://github.com/ayankhan96686-create/-Beyond-the-Fort.git beyond-the-fort
cd beyond-the-fort

# Create Python virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r multiagent-engine/requirements.txt
deactivate

# Install Node dependencies
npm ci --omit=dev

# Configure production environment
cp .env.example .env
nano .env # Paste production credentials
```

### Step 3: Launch Services via PM2
```bash
# Start dual services using the bundled PM2 configuration
pm2 start ecosystem.config.js

# Save process list and enable system boot persistence
pm2 save
pm2 startup
```

### Step 4: Configure Nginx & SSL
```bash
sudo cp nginx.conf /etc/nginx/sites-available/beyond-the-fort
sudo ln -s /etc/nginx/sites-available/beyond-the-fort /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtain free Let's Encrypt SSL certificate
sudo certbot --nginx -d yourdomain.com
```

---

## 6. Post-Deployment Verification Checklist

Once deployed to any cloud provider, perform these 5 verification checks:

1. **Readiness Probe:**
   ```bash
   curl -I https://your-deployment-url/ready
   # Expect: HTTP/1.1 200 OK
   ```

2. **Python LangGraph Process Health:**
   ```bash
   curl -s https://your-deployment-url/api/v1/tourism-plan -X POST \
     -H "Content-Type: application/json" -d '{}'
   # Expect: 401 Unauthorized (Auth protection verified) or CSRF rejection
   ```

3. **Gemini Chatbot Live Inference:**
   - Open `https://your-deployment-url/chat` in browser.
   - Send prompt: `"Tell me about the Dhrupad classical music tradition of Gwalior"`.
   - Verify badge displays: `✨ AI Assistant (Gemini 2.5 Flash)`.

4. **Itinerary Generation & Image Verification:**
   - Sign in and plan a 3-hour culinary visit from Gwalior Railway Station.
   - Verify that all stop cards render distinct, authentic Wikimedia Commons images with real photographer attributions.

5. **Security Headers Check:**
   ```bash
   curl -I https://your-deployment-url/
   # Verify: X-Frame-Options: DENY
   # Verify: X-Content-Type-Options: nosniff
   # Verify: Strict-Transport-Security present
   # Verify: X-Powered-By is absent
   ```

