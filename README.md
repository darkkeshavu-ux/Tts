# VoxGlow AI — beginner setup guide

The site now includes an installable web-app interface, Hindi/English text chat, microphone input where supported, spoken replies, and a secure-backend template.

## Important: finish the one-time setup

I updated the public repository code, but I cannot create accounts for you or access your private API keys. To activate actual AI replies, follow these steps. **Never paste your Gemini API key into `index.html`, GitHub, a screenshot, or a public chat.**

### Step 1 — Create a Gemini API key
1. Open https://aistudio.google.com/apikey and sign in.
2. Create an API key and follow Google's current terms and usage limits.
3. Keep the key private.

### Step 2 — Create the backend Worker
1. Open https://dash.cloudflare.com/ and sign in or create an account.
2. Open **Workers & Pages** and create a Worker.
3. Choose the edit-code option.
4. Open `cloudflare-worker.js` in this repository, copy the whole file, paste it into the Worker editor, then save and deploy.
5. In Worker settings, find **Variables and Secrets**. Add a **secret** named exactly `GEMINI_API_KEY` and paste your Gemini key as the value. Save/redeploy if prompted.
6. Your Worker URL looks like `https://your-worker-name.your-account.workers.dev`. Open it with `/health` appended. It should return a small JSON message confirming the service is running. Never put the API key in the URL.

### Step 3 — Connect the website to your Worker
1. Open `index.html` in this repository and choose Edit (pencil).
2. Find `const API_URL =`.
3. Replace `PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE/api/chat` with your real Worker URL followed by `/api/chat`, for example `https://your-worker-name.your-account.workers.dev/api/chat`.
4. Commit/save the file. GitHub Pages publishes it automatically after a short wait.

### Step 4 — Test on Android
1. Open https://darkkeshavu-ux.github.io/Tts/ in Chrome.
2. Try typing `नमस्ते, तुम कैसे हो?` and then `Tell me a fun fact.`
3. Tap the microphone and allow permission. If browser voice recognition isn't supported, use the microphone on your Android keyboard to dictate.
4. Choose **Natural** or **Robot** for spoken replies, or **Text only** to disable automatic speech.

### Step 5 — Install on your home screen
1. In Chrome, tap **＋ Install** if shown.
2. If it doesn't appear, open Chrome's ⋮ menu and choose **Install app** or **Add to Home screen** (wording varies by device).
3. Start VoxGlow from the home screen. The app shell can open offline; AI chat requires internet.

## Troubleshooting
- **Setup URL message**: the Worker URL has not been added to `index.html`.
- **Backend setup incomplete**: create the `GEMINI_API_KEY` Worker secret.
- **403 website not allowed**: open the official GitHub Pages address above.
- **429 usage limit**: wait for quota reset. Free tiers have limits and terms can change.
- **Microphone doesn't work**: use Chrome on Android, allow microphone access, and select Hindi or English. Recognition support depends on the browser.
- **No spoken reply**: check Android's text-to-speech settings. VoxGlow uses voices installed on your phone.

## Notes
- The Gemini API key stays on the server as a Worker secret, not in the public site.
- The Worker limits the amount of chat history and the length of each message.
- This uses browser speech recognition/synthesis, not a separate paid voice service.
- Free service tiers and provider terms can change.
- Don't share passwords, OTPs, or sensitive personal information with the chat.
