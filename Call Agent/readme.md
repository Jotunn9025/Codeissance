Goal
Build a phone-in multilingual health assistant: any caller dials, speaks in Hindi, Sindhi, English, Punjabi, etc., the bot transcribes, Gemini gives a friendly answer, and Twilio plays it back. Caller needs zero data plan—plain voice call. Support two conversational turns, then politely end.

Core Requirements

Telephony: Twilio Programmable Voice (trial credits are fine) receives & handles calls.

Speech-to-Text:

Use Gemini’s speech API or Google Cloud Speech for auto-language detection (Hindi, Sindhi, English, Punjabi, etc.).

Return transcript + detected language code.

LLM Brain: Gemini 1.5 Flash.

System prompt:

You are a rural tele-health assistant. 
Respond briefly and clearly in the same language as the caller. 
If caller mentions chest pain, fainting, or severe bleeding, immediately advise to call emergency services.


Speech Playback: use Twilio TwiML <Say> with correct language/voice attributes (fallback to English if Twilio voice doesn’t support Sindhi).

Conversation:

Turn 1 – greet & ask for symptoms.

Turn 2 – let caller ask follow-up, respond, then end with “stay healthy, goodbye”.

Code:

Either Python (Flask/FastAPI) or Node.js (Express).

No DB required for prototype.

.env for TWILIO_SID, TWILIO_TOKEN, GEMINI_KEY.

Return valid TwiML every step.

Hints

Endpoints:

/voice → greet, prompt, record caller.

/recording1 → STT + Gemini → reply + TwiML for 1st answer.

/recording2 → repeat for 2nd turn → politely hang up.

Use Twilio’s built-in <Say> voices for Hindi/Punjabi. For Sindhi, fallback TTS may be English voice reading Sindhi script or transliteration.

Stretch Ideas (if time)

Plug in Gemini TTS (WaveNet) or Google TTS for better Sindhi/Punjabi voice.

Save audio + transcript to Mongo later.

Detect sentiment / urgency → connect human doctor.

---

Setup

1. Prerequisites

- Node.js 18+
- Twilio account (trial OK)
- Google Cloud project with Speech-to-Text enabled and a service account key JSON
- Gemini API key

2. Install

```bash
npm install
```

3. Environment

Create a `.env` file at project root based on below:

```env
PORT=3000
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_twilio_auth_token
GEMINI_KEY=your_gemini_api_key
USE_GOOGLE_STT=false
# If using Google STT, also set:
# GOOGLE_APPLICATION_CREDENTIALS=./gcloud-key.json
```

Skipping Google credentials: leave `USE_GOOGLE_STT=false` (default). The app will use Gemini for transcription (English/Hindi) and responses. If you prefer Google STT, set `USE_GOOGLE_STT=true` and provide `GOOGLE_APPLICATION_CREDENTIALS`.

4. Run locally

```bash
npm run dev
```

5. Expose to Twilio (choose one)

- Use Twilio Functions/Serverless and deploy endpoints
- Or use `ngrok` to tunnel your local server:

```bash
ngrok http 3000
```

6. Configure Twilio webhooks

**Voice Webhook:**
- In Twilio Console → Phone Numbers → Your Number → Voice & Fax
- Set "A Call Comes In" webhook to your public URL `/voice` (POST)
- Example: `https://<your-domain>/voice`

**SMS Webhook:**
- In Twilio Console → Phone Numbers → Your Number → Messaging
- Set "A Message Comes In" webhook to your public URL `/sms` (POST)
- Example: `https://<your-domain>/sms`

Endpoints

**Voice Endpoints:**
- `POST /voice`: Greets caller and starts recording
- `POST /process-recording`: Processes recording and generates AI response
- `POST /handle-followup`: Handles follow-up questions

**SMS Endpoints:**
- `POST /sms`: Handles incoming text messages with AI responses
- `POST /send-sms`: Sends test SMS to your number

**Utility Endpoints:**
- `POST /call`: Initiates a test call to your number
- `GET /`: Health check and service info

Notes

- Auto language detection is enabled in Google STT. We seed with `hi-IN` and allow alternatives `en-US`, `pa-IN`, `ur-IN`.
- Twilio `<Say>` voice mapping falls back to English for unsupported languages like Sindhi.
- Trial Twilio recording URLs may require basic auth with `TWILIO_SID` and `TWILIO_TOKEN` to download; this is handled in code.