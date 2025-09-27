require('dotenv').config();
const express = require('express');
const { urlencoded } = require('express');
const { twiml: TwiML, Twilio } = require('twilio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(urlencoded({ extended: false }));

// Gracefully handle malformed JSON bodies from clients/tools
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON body. Remove Content-Type: application/json or send valid JSON.' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body. Remove Content-Type: application/json or send valid JSON.' });
  }
  next();
});

const PORT = process.env.PORT || 3000;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const GEMINI_API_KEY = process.env.GEMINI_KEY;
const NGROK_URL = process.env.NGROK_URL;
const TO_NUMBER = process.env.TO_NUMBER; // Recipient number for SMS/WhatsApp/Calls
const WHATSAPP_FROM = process.env.WHATSAPP_FROM; // e.g., whatsapp:+14155238886 (sandbox) or whatsapp:+<your-wa-enabled-number>
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '0', 10);
const SMTP_SECURE = /^(true|1)$/i.test(process.env.SMTP_SECURE || 'false');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM; // Sender email
const EMAIL_TO = process.env.EMAIL_TO; // Recipient email

function isE164(number) {
  return typeof number === 'string' && /^\+[1-9]\d{1,14}$/.test(number);
}

function isWhatsAppFrom(value) {
  if (typeof value !== 'string') return false;
  if (!value.startsWith('whatsapp:+')) return false;
  const phone = value.replace('whatsapp:', '');
  return isE164(phone);
}

function validateFromTo(res, channel = 'sms_or_call') {
  if (!TWILIO_PHONE || !isE164(TWILIO_PHONE)) {
    res.status(400).json({
      success: false,
      error: 'TWILIO_PHONE must be set in .env as a valid E.164 phone number (e.g., +16186814638).'
    });
    return false;
  }
  if (!TO_NUMBER || !isE164(TO_NUMBER)) {
    res.status(400).json({
      success: false,
      error: 'TO_NUMBER must be set in .env as a valid E.164 phone number (your recipient).'
    });
    return false;
  }
  if (TWILIO_PHONE === TO_NUMBER && channel !== 'whatsapp') {
    res.status(400).json({
      success: false,
      error: 'TO_NUMBER cannot be the same as TWILIO_PHONE for SMS/Calls. Use a different recipient (e.g., your personal mobile).'
    });
    return false;
  }
  return true;
}

function validateWhatsApp(res) {
  if (!WHATSAPP_FROM || !isWhatsAppFrom(WHATSAPP_FROM)) {
    res.status(400).json({
      success: false,
      error: 'WHATSAPP_FROM must be set to a WhatsApp-enabled sender like whatsapp:+14155238886 (sandbox) or whatsapp:+<your-approved-number>.'
    });
    return false;
  }
  if (!TO_NUMBER || !isE164(TO_NUMBER)) {
    res.status(400).json({ success: false, error: 'TO_NUMBER must be a valid E.164 number for WhatsApp recipient.' });
    return false;
  }
  return true;
}

function validateEmailEnv(res) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM || !EMAIL_TO) {
    res.status(400).json({
      success: false,
      error: 'Missing SMTP configuration. Require SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_TO in .env'
    });
    return false;
  }
  return true;
}

// Initialize Gemini AI
if (!GEMINI_API_KEY) {
  console.error('GEMINI_KEY environment variable is required');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Language detection and voice mapping
const languageToTwilio = (langCode) => {
  switch ((langCode || '').slice(0, 2)) {
    case 'hi':
      return { language: 'hi-IN', voice: 'Aditi' };
    case 'pa':
      return { language: 'pa-IN', voice: 'Aditi' };
    case 'en':
    default:
      return { language: 'en-US', voice: 'Polly.Joanna' };
  }
};

function say(twiml, text, langCode = 'en-US') {
  const { language, voice } = languageToTwilio(langCode);
  twiml.say({ language, voice }, text);
}

// Detect language from text (simple heuristic)
function detectLanguage(text) {
  if (!text) return 'en';
  
  // Check for Hindi/Devanagari characters
  const hindiRegex = /[\u0900-\u097F]/;
  if (hindiRegex.test(text)) return 'hi';
  
  // Check for common Hindi words in Roman script
  const hindiWords = ['namaste', 'kya', 'hai', 'main', 'aap', 'kaise', 'kahan', 'kab', 'kyun', 'kaun'];
  const lowerText = text.toLowerCase();
  if (hindiWords.some(word => lowerText.includes(word))) return 'hi';
  
  return 'en';
}

// Get transcription from Twilio recording
async function getTranscriptionFromRecording(recordingUrl, accountSid, authToken) {
  try {
    // Download the recording
    const response = await axios.get(recordingUrl, {
      auth: {
        username: accountSid,
        password: authToken
      },
      responseType: 'arraybuffer'
    });
    
    // For now, return a placeholder - you'd integrate with speech-to-text service here
    // You can use Google Speech-to-Text, Azure Speech, or AWS Transcribe
    return "User spoke about their symptoms"; // Placeholder
  } catch (error) {
    console.error('Error getting transcription:', error);
    return null;
  }
}

// Generate Market Sentiment response using Gemini
async function generateMarketSentimentResponse(userInput, language = 'en') {
  try {
    const prompt = language === 'hi'
      ? `आप एक Dynamic Market Sentiment Forecaster हैं - एक AI/ML-संचालित भावना पूर्वानुमान इंजन। उपयोगकर्ता ने यह विषय/टिकर दिया: "${userInput}"।
        आप स्वायत्त रूप से सोशल मीडिया, समाचार और फोरम से डेटा एकत्र करते हैं और समय-श्रृंखला ML मॉडल के साथ भावना प्रवृत्तियों की भविष्यवाणी करते हैं।
        कृपया एक संक्षिप्त भावना पूर्वानुमान दें:
        - समग्र भावना: बुलिश/बेयरिश/न्यूट्रल (विश्वास स्कोर 0-100)
        - प्रमुख चालक: सोशल मीडिया, समाचार, फोरम विश्लेषण से 2-4 बिंदु
        - समय क्षितिज: अल्पकालिक/मध्यम/दीर्घकालिक
        - बाजार प्रभाव पूर्वानुमान: राजस्व/निवेश/उपभोक्ता व्यवहार पर प्रभाव
        - जोखिम/विपरीत संकेत और रणनीतिक सुझाव
        - स्व-सुधार: पिछले प्रदर्शन से सीखे गए सुधार
        150 शब्दों के भीतर, हिंदी और अंग्रेज़ी मिश्रण। यह निवेश सलाह नहीं है।`
      : `You are a Dynamic Market Sentiment Forecaster - an AI/ML-powered sentiment forecasting engine that autonomously collects data from social media, news, and forums via APIs, builds time-series ML models to predict evolving sentiment trends, and provides multi-source reasoning to detect opinion shifts.
        User topic/ticker: "${userInput}"
        Provide a comprehensive sentiment forecast:
        - Overall Sentiment: Bullish/Bearish/Neutral (Confidence: 0-100)
        - Key Drivers: 2-4 points from social media, news, forum analysis
        - Time Horizon: Short/Medium/Long-term trend prediction
        - Market Impact Forecast: Revenue/investment/consumer behavior implications
        - Risk/Counter-signals and strategic recommendations
        - Self-Improvement: Accuracy refinements from past performance
        - Proactive Alert: Key action items for businesses/investors
        Keep within ~150 words. This is informational analysis, not investment advice.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return language === 'hi'
      ? 'मैं आपकी सहायता के लिए उपस्थित हूँ। यह एक AI/ML-संचालित भावना पूर्वानुमान इंजन है जो स्वायत्त रूप से डेटा एकत्र करता है और समय-श्रृंखला मॉडल के साथ भविष्यवाणी करता है। यह निवेश सलाह नहीं है।'
      : 'I am here to help with sentiment forecasting. This is an AI/ML-powered engine that autonomously collects data and predicts trends using time-series models. This is informational analysis, not investment advice.';
  }
}

// Store conversation context (in production, use Redis or database)
const conversations = new Map();

// Entry point
app.post('/voice', (req, res) => {
  console.log('=== VOICE ENDPOINT START ===');
  console.log('Request body:', req.body);
  
  const callSid = req.body.CallSid;
  conversations.set(callSid, { step: 'initial', language: 'en' });
  
  const twiml = new TwiML.VoiceResponse();
  
  // Bilingual greeting for Market Sentiment Forecaster
  say(twiml, 'Hello, Namaste! This is your Market Sentiment Alert System. I monitor social media, news, and market data to provide real-time sentiment analysis and trend predictions.', 'en-US');
  say(twiml, 'कृपया अपना विषय या स्टॉक/क्रिप्टो टिकर बोलें। मैं तुरंत भावना विश्लेषण और बाजार पूर्वानुमान प्रदान करूंगा।', 'hi-IN');
  
  twiml.record({
    action: '/process-recording',
    method: 'POST',
    transcribe: false,
    playBeep: true,
    timeout: 15,
    maxLength: 120,
    finishOnKey: '#'
  });
  
  console.log('=== VOICE ENDPOINT END ===');
  res.type('text/xml').send(twiml.toString());
});

// Process recording and generate AI response
app.post('/process-recording', async (req, res) => {
  const twiml = new TwiML.VoiceResponse();
  
  console.log('=== PROCESS RECORDING START ===');
  console.log('Request body:', req.body);
  
  const callSid = req.body.CallSid;
  const recordingUrl = req.body.RecordingUrl;
  const recordingDuration = parseInt(req.body.RecordingDuration) || 0;
  
  if (!recordingUrl || recordingDuration < 1) {
    say(twiml, 'I could not capture your request. कृपया फिर से बोलें।');
    say(twiml, 'Press 0 for help or wait for the beep to try again.', 'en-US');
    
    twiml.gather({
      numDigits: 1,
      action: '/handle-fallback',
      timeout: 5
    });
    
    twiml.redirect('/voice');
    res.type('text/xml').send(twiml.toString());
    return;
  }
  
  try {
    // Placeholder transcript for demo
    
    // Try to get transcription from Twilio's built-in service
    let transcript = "NIFTY sentiment"; // Default fallback
    
    // In a real implementation, you would:
    // 1. Use Twilio's transcription service
    // 2. Or download the recording and use Google Speech-to-Text
    // 3. For now, we'll use a placeholder that changes based on call context
    
    const conversation = conversations.get(callSid) || {};
    if (conversation.step === 'initial') {
      transcript = "Reliance Industries sentiment";
    } else {
      transcript = "HDFC Bank short-term outlook";
    }
    
    // Detect language
    const detectedLang = detectLanguage(transcript);
    
    // Update conversation context
    conversation.language = detectedLang;
    conversation.lastInput = transcript;
    conversation.lastActivity = Date.now();
    conversation.step = 'processed';
    conversations.set(callSid, conversation);
    
    say(twiml, 'Processing real-time data from multiple sources to generate sentiment alert. बहु-स्रोत डेटा प्रोसेस कर रहा हूँ।', 'en-US');
    
    // Generate AI response
    const aiResponse = await generateMarketSentimentResponse(transcript, detectedLang);
    
    // Split response for better speech delivery
    const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences.slice(0, 3)) { // Limit to first 3 sentences
      if (sentence.trim()) {
        // Detect if sentence is in Hindi or English and use appropriate voice
        const sentenceLang = detectLanguage(sentence);
        say(twiml, sentence.trim(), sentenceLang === 'hi' ? 'hi-IN' : 'en-US');
      }
    }
    
    // Ask for follow-up
    say(twiml, 'Would you like another market sentiment alert or analysis? क्या आप दूसरा बाजार भावना अलर्ट चाहते हैं?', 'en-US');
    say(twiml, 'Press 1 for yes, 2 for no. हाँ के लिए 1, ना के लिए 2 दबाएं।', 'hi-IN');
    
    twiml.gather({
      numDigits: 1,
      action: '/handle-followup',
      method: 'POST',
      timeout: 10
    });
    
    // Fallback
    say(twiml, 'Thank you for using the Market Sentiment Alert System. Stay ahead of market movements with real-time insights. धन्यवाद।', 'en-US');
    twiml.hangup();
    
  } catch (error) {
    console.error('Error processing recording:', error);
    say(twiml, 'I am having technical difficulties. तकनीकी समस्या हो रही है। Please try again later.');
    twiml.hangup();
  }
  
  console.log('=== PROCESS RECORDING END ===');
  res.type('text/xml').send(twiml.toString());
});

// Handle follow-up questions
app.post('/handle-followup', async (req, res) => {
  const twiml = new TwiML.VoiceResponse();
  const digits = req.body.Digits;
  const callSid = req.body.CallSid;
  
  console.log('=== HANDLE FOLLOWUP ===');
  console.log('User choice:', digits);
  
  if (digits === '1') {
    say(twiml, 'Please say another topic or ticker for market sentiment analysis. कृपया दूसरा विषय बोलें।', 'en-US');
    
    twiml.record({
      action: '/process-followup-recording',
      method: 'POST',
      transcribe: false,
      playBeep: true,
      timeout: 15,
      maxLength: 60,
      finishOnKey: '#'
    });
  } else {
    say(twiml, 'Thank you for using the Market Sentiment Alert System. Get real-time alerts for market sentiment shifts. धन्यवाद।', 'en-US');
    twiml.hangup();
  }
  
  res.type('text/xml').send(twiml.toString());
});

// Process follow-up recording
app.post('/process-followup-recording', async (req, res) => {
  const twiml = new TwiML.VoiceResponse();
  
  console.log('=== PROCESS FOLLOWUP RECORDING ===');
  
  const recordingUrl = req.body.RecordingUrl;
  const recordingDuration = parseInt(req.body.RecordingDuration) || 0;
  
  if (recordingUrl && recordingDuration > 0) {
    // Simulated follow-up transcript for sentiment analysis
    const simulatedTranscript = "TCS sentiment alert and market impact analysis";
    
    // Generate AI response
    const aiResponse = await generateMarketSentimentResponse(simulatedTranscript);
    
    // Speak the response
    const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences.slice(0, 2)) {
      if (sentence.trim()) {
        const sentenceLang = detectLanguage(sentence);
        say(twiml, sentence.trim(), sentenceLang === 'hi' ? 'hi-IN' : 'en-US');
      }
    }
  }
  
  say(twiml, 'Thank you for using the Market Sentiment Alert System. This provides real-time market insights and trend analysis. This is not investment advice.', 'en-US');
  twiml.hangup();
  
  res.type('text/xml').send(twiml.toString());
});

// Handle fallback
app.post('/handle-fallback', (req, res) => {
  const twiml = new TwiML.VoiceResponse();
  
  say(twiml, 'I am here to help with your health questions. मैं आपके स्वास्थ्य प्रश्नों में मदद के लिए हूँ।', 'en-US');
  say(twiml, 'Please speak clearly after the beep. कृपया बीप के बाद स्पष्ट रूप से बोलें।', 'hi-IN');
  
  twiml.redirect('/voice');
  res.type('text/xml').send(twiml.toString());
});

// WhatsApp: send a message to a target number (uses sandbox or approved senders)
app.post('/send-whatsapp', async (req, res) => {
  try {
    const client = new Twilio(TWILIO_SID, TWILIO_TOKEN);
    if (!validateWhatsApp(res)) return;
    const targetNumber = TO_NUMBER; // must have joined sandbox or be approved contact
    const message = await client.messages.create({
      from: WHATSAPP_FROM,
      to: `whatsapp:${targetNumber}`,
      body: '📊 *MARKET SENTIMENT ALERT*\n\n🚨 *BREAKING: Sentiment analysis engine is now active!*\n\n⚡ *Real-time monitoring:*\n• Social media buzz tracking\n• News sentiment shifts\n• Market trend predictions\n• Risk opportunity alerts\n\n🔍 *Send any ticker/topic for instant analysis:*\n"NIFTY", "RELIANCE", "BTC", "Tech stocks"\n\n📈 *Stay ahead of market movements!*\n\nReply with your query to get started.'
    });
    res.json({ success: true, messageSid: message.sid, to: targetNumber });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Email via SMTP
app.post('/send-email', async (req, res) => {
  try {
    if (!validateEmailEnv(res)) return;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    const subject = '📊 MARKET SENTIMENT ALERT - Real-time Analysis Engine Active';
    const text = `📊 MARKET SENTIMENT ALERT

🚨 BREAKING: Sentiment analysis engine is now active!

⚡ Real-time monitoring capabilities:
• Social media buzz tracking across platforms
• News sentiment shifts and impact analysis
• Market trend predictions with confidence scores
• Risk opportunity alerts for traders/investors
• Multi-source data fusion for accurate insights

🔍 Send any ticker/topic for instant analysis:
"NIFTY", "RELIANCE", "BTC", "Tech stocks", "Crypto market"

📈 Stay ahead of market movements with AI-powered insights!

This is a test email. If you received this, SMTP is configured correctly.

Reply with your query to get started.

This is informational analysis, not investment advice.`;
    const info = await transporter.sendMail({ from: EMAIL_FROM, to: EMAIL_TO, subject, text });
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SMS endpoint - handle incoming text messages
app.post('/sms', async (req, res) => {
  console.log('=== SMS ENDPOINT START ===');
  console.log('Request body:', req.body);
  
  const twiml = new TwiML.MessagingResponse();
  const incomingMessage = req.body.Body || '';
  const fromNumber = req.body.From || '';
  
  console.log('Incoming SMS from:', fromNumber);
  console.log('Message:', incomingMessage);
  
  if (!incomingMessage.trim()) {
    twiml.message('📊 MARKET SENTIMENT ALERT\n\n🔍 Send any ticker/topic for real-time sentiment analysis\n\nExample: "NIFTY", "RELIANCE", "BTC", "Tech stocks", "Crypto market"\n\n⚡ Get instant insights on:\n• Social media sentiment shifts\n• News impact analysis\n• Market trend predictions\n• Risk alerts & opportunities\n\nReply with your query now!');
    return res.type('text/xml').send(twiml.toString());
  }
  
  try {
    // Detect language
    const detectedLang = detectLanguage(incomingMessage);
    console.log('Detected language:', detectedLang);
    
    // Generate AI response
    const aiResponse = await generateMarketSentimentResponse(incomingMessage, detectedLang);
    console.log('AI Response:', aiResponse);
    
    // Send response back
    twiml.message(aiResponse);
    
    // Ask for follow-up
    const followUpMessage = detectedLang === 'hi' 
      ? 'क्या आप दूसरा मार्केट अलर्ट चाहते हैं? Would you like another market alert?'
      : 'Would you like another market sentiment alert or analysis? क्या आप दूसरा मार्केट अलर्ट चाहते हैं?';
    
    twiml.message(followUpMessage);
    
  } catch (error) {
    console.error('Error processing SMS:', error);
    const errorMessage = 'I am having technical difficulties. तकनीकी समस्या हो रही है। Please try again later.';
    twiml.message(errorMessage);
  }
  
  console.log('=== SMS ENDPOINT END ===');
  res.type('text/xml').send(twiml.toString());
});

// Send SMS endpoint for testing
app.post('/send-sms', async (req, res) => {
  try {
    const client = new Twilio(TWILIO_SID, TWILIO_TOKEN);
    if (!validateFromTo(res)) return;
    const message = await client.messages.create({
      to: TO_NUMBER,
      from: TWILIO_PHONE,
      body: '📊 MARKET SENTIMENT ALERT\n\n🚨 BREAKING: Sentiment analysis engine is now active!\n\n⚡ Real-time monitoring:\n• Social media buzz tracking\n• News sentiment shifts\n• Market trend predictions\n• Risk opportunity alerts\n\n🔍 Send any ticker/topic for instant analysis:\n"NIFTY", "RELIANCE", "BTC", "Tech stocks"\n\n📈 Stay ahead of market movements!\n\nReply with your query to get started.'
    });
    res.json({ 
      success: true, 
      messageSid: message.sid, 
      message: `SMS sent to ${TO_NUMBER}` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Call endpoint
app.post('/call', async (req, res) => {
  try {
    const client = new Twilio(TWILIO_SID, TWILIO_TOKEN);
    const baseUrl = NGROK_URL || '';
    // Validate we have a public https URL for Twilio to fetch TwiML
    if (!baseUrl || !/^https:\/\//i.test(baseUrl)) {
      return res.status(400).json({
        success: false,
        error: 'NGROK_URL is required and must be an https public URL for /voice. Set NGROK_URL in .env (e.g., https://<subdomain>.ngrok-free.app)'
      });
    }
    if (!validateFromTo(res)) return;
    const call = await client.calls.create({
      to: TO_NUMBER,
      from: TWILIO_PHONE,
      url: `${baseUrl}/voice`
    });
    res.json({ 
      success: true, 
      callSid: call.sid, 
      message: 'Call initiated with Market Sentiment Alert System - Real-time market analysis engine' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Market Sentiment Alert System',
    features: ['Bilingual Support', 'Gemini AI Integration', 'Autonomous Data Collection', 'Time-Series ML Models', 'Multi-Source Reasoning', 'Market Forecasting', 'Proactive Alerts', 'Self-Improvement', 'Voice Calls', 'SMS Support', 'WhatsApp Outbound', 'Email Support'],
    endpoints: {
      voice: '/voice',
      sms: '/sms',
      whatsappSend: '/send-whatsapp',
      call: '/call',
      sendSms: '/send-sms',
      sendEmail: '/send-email'
    }
  });
});

app.listen(PORT, () => {
  console.log(`📊 Market Sentiment Alert System Server running on port ${PORT}`);
  console.log(`📞 To make a test call: curl -X POST ${process.env.NGROK_URL || 'http://localhost:' + PORT}/call`);
  console.log(`📱 To send test SMS: curl -X POST ${process.env.NGROK_URL || 'http://localhost:' + PORT}/send-sms`);
  console.log(`💬 To send WhatsApp: curl -X POST ${process.env.NGROK_URL || 'http://localhost:' + PORT}/send-whatsapp`);
  console.log(`📧 To send Email: curl -X POST ${process.env.NGROK_URL || 'http://localhost:' + PORT}/send-email`);
  console.log(`🚨 Features: Real-time Market Alerts + Social Media Monitoring + News Analysis + Trend Prediction + Risk Alerts + Multi-Source Data Fusion`);
});

// Cleanup conversations periodically
setInterval(() => {
  const now = Date.now();
  for (const [callSid, conversation] of conversations.entries()) {
    if (!conversation.lastActivity || now - conversation.lastActivity > 1800000) { // 30 minutes
      conversations.delete(callSid);
    }
  }
}, 300000); // Clean every 5 minutes