require('dotenv').config();
const express = require('express');
const { urlencoded } = require('express');
const { twiml: TwiML, Twilio } = require('twilio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const app = express();
app.use(urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const GEMINI_API_KEY = process.env.GEMINI_KEY;

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

// Generate AI response using Gemini (market sentiment)
async function generateHealthResponse(userInput, language = 'en') {
  try {
    const prompt = language === 'hi' ? 
      `आप एक मार्केट सेंटिमेंट और फोरकास्ट सहायक हैं। उपयोगकर्ता ने कहा: "${userInput}"
      1) 1-2 लाइन में वर्तमान सेंटिमेंट बताएं (Positive/Neutral/Negative) और मुख्य कारण।
      2) 1-2 लाइन में अगले 24-48 घंटों की संभावित दिशा और कॉन्फिडेंस (0-100%).
      3) 1 लाइन में एक छोटा actionable सुझाव।
      हिंदी और अंग्रेजी दोनों में संक्षिप्त उत्तर दें, कुल 100 शब्दों के भीतर।` :
      `You are a market sentiment and forecasting assistant. The user said: "${userInput}"
      1) In 1-2 lines, state current sentiment (Positive/Neutral/Negative) with a key reason.
      2) In 1-2 lines, give a 24-48h directional outlook with confidence (0-100%).
      3) In 1 line, provide one actionable suggestion.
      Respond briefly in both English and Hindi, within 100 words total.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return language === 'hi' ? 
      'मुझे खुशी होगी आपकी मदद करने में। कृपया डॉक्टर से सलाह लें। I am here to help you. Please consult a doctor.' :
      'I am here to help you. Please consult a doctor for proper medical advice. मैं आपकी मदद के लिए यहाँ हूँ। कृपया डॉक्टर से सलाह लें।';
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
  
  // Bilingual greeting (market sentiment context)
  say(twiml, 'Hello, Namaste! I am your market sentiment assistant. मैं आपका मार्केट सेंटिमेंट सहायक हूँ।', 'en-US');
  say(twiml, 'Say a stock or company name to get sentiment and forecast. किसी स्टॉक या कंपनी का नाम बोलें।', 'hi-IN');
  
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
    say(twiml, 'I could not capture your message. आपका संदेश रिकॉर्ड नहीं हो सका। Please try speaking again.');
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
    // In a real implementation, you would:
    // 1. Convert audio to text using speech-to-text service
    // 2. For now, we'll simulate with a placeholder
    
    // Try to get transcription from Twilio's built-in service
    let transcript = "Analyze Apple stock sentiment"; // Default fallback
    
    // In a real implementation, you would:
    // 1. Use Twilio's transcription service
    // 2. Or download the recording and use Google Speech-to-Text
    // 3. For now, we'll use a placeholder that changes based on call context
    
    const conversation = conversations.get(callSid) || {};
    if (conversation.step === 'initial') {
      transcript = "Analyze Apple stock sentiment";
    } else {
      transcript = "Give me a short forecast for Tesla";
    }
    
    // Detect language
    const detectedLang = detectLanguage(transcript);
    
    // Update conversation context
    conversation.language = detectedLang;
    conversation.lastInput = transcript;
    conversation.lastActivity = Date.now();
    conversation.step = 'processed';
    conversations.set(callSid, conversation);
    
    say(twiml, 'Let me analyze the market sentiment and forecast. मैं सेंटिमेंट और फोरकास्ट का विश्लेषण कर रहा हूँ।', 'en-US');
    
    // Generate AI response
    const aiResponse = await generateHealthResponse(transcript, detectedLang);
    
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
    say(twiml, 'Do you want another stock or timeframe? क्या आप दूसरा स्टॉक या टाइमफ्रेम चाहते हैं?', 'en-US');
    say(twiml, 'Press 1 for yes, 2 for no. हाँ के लिए 1, ना के लिए 2 दबाएं।', 'hi-IN');
    
    twiml.gather({
      numDigits: 1,
      action: '/handle-followup',
      method: 'POST',
      timeout: 10
    });
    
    // Fallback
    say(twiml, 'Thank you for calling the sentiment assistant. धन्यवाद।', 'en-US');
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
    say(twiml, 'Please ask your question. अपना प्रश्न पूछें।', 'en-US');
    
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
    say(twiml, 'Thank you for using our health service. स्वास्थ्य सेवा का उपयोग करने के लिए धन्यवाद।', 'en-US');
    say(twiml, 'Stay healthy and take care. स्वस्थ रहें और अपना ख्याल रखें।', 'hi-IN');
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
    // Simulate transcription
    const simulatedTranscript = "Can you suggest some home remedies?";
    
    // Generate AI response
    const aiResponse = await generateHealthResponse(simulatedTranscript);
    
    // Speak the response
    const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences.slice(0, 2)) {
      if (sentence.trim()) {
        const sentenceLang = detectLanguage(sentence);
        say(twiml, sentence.trim(), sentenceLang === 'hi' ? 'hi-IN' : 'en-US');
      }
    }
  }
  
  say(twiml, 'Thank you for calling. Remember to consult a healthcare professional. धन्यवाद, डॉक्टर से सलाह लेना न भूलें।', 'en-US');
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
    twiml.message('Please send your symptoms or health questions. कृपया अपने लक्षण या स्वास्थ्य प्रश्न भेजें।');
    return res.type('text/xml').send(twiml.toString());
  }
  
  try {
    // Detect language
    const detectedLang = detectLanguage(incomingMessage);
    console.log('Detected language:', detectedLang);
    
    // Generate AI response
    const aiResponse = await generateHealthResponse(incomingMessage, detectedLang);
    console.log('AI Response:', aiResponse);
    
    // Send response back
    twiml.message(aiResponse);
    
    // Ask for follow-up
    const followUpMessage = detectedLang === 'hi' 
      ? 'क्या आपका कोई और सवाल है? Do you have any other questions?'
      : 'Do you have any other questions? क्या आपका कोई और सवाल है?';
    
    twiml.message(followUpMessage);
    
  } catch (error) {
    console.error('Error processing SMS:', error);
    const errorMessage = 'I am having technical difficulties. तकनीकी समस्या हो रही है। Please try again later.';
    twiml.message(errorMessage);
  }
  
  console.log('=== SMS ENDPOINT END ===');
  res.type('text/xml').send(twiml.toString());
});

// Send WhatsApp message endpoint
app.post('/send-whatsapp', async (req, res) => {
  try {
    const client = new Twilio(TWILIO_SID, TWILIO_TOKEN);
    const to = (req.body && req.body.to) || process.env.TO_NUMBER;
    const body = (req.body && req.body.body) || 'Sentiment Alert: Stock moved significantly. इस स्टॉक में महत्वपूर्ण बदलाव आया है।';
    const fromWhats = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
    if (!to || !fromWhats) throw new Error('Missing TO_NUMBER or TWILIO_WHATSAPP_FROM');
    const message = await client.messages.create({ to: `whatsapp:${to}`, from: fromWhats, body });
    res.json({ 
      success: true, 
      messageSid: message.sid, 
      message: `WhatsApp sent to ${to}` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Call endpoint (uses NGROK_URL or BASE_URL)
app.post('/call', async (req, res) => {
  try {
    const client = new Twilio(TWILIO_SID, TWILIO_TOKEN);
    const to = (req.body && req.body.to) || process.env.TO_NUMBER;
    const baseUrl = process.env.NGROK_URL || process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
    if (!to || !TWILIO_PHONE) throw new Error('Missing TO_NUMBER or TWILIO_PHONE');
    const url = `${baseUrl}/voice`;
    const call = await client.calls.create({ to, from: TWILIO_PHONE, url });
    res.json({ 
      success: true, 
      callSid: call.sid, 
      message: `Call initiated to ${to}` 
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
    service: 'Market Sentiment Assistant',
    features: ['Bilingual Support', 'Gemini AI Integration', 'Dynamic Responses', 'Voice Calls', 'WhatsApp Alerts'],
    endpoints: {
      voice: '/voice',
      sms: '/sms',
      call: '/call',
      sendWhatsApp: '/send-whatsapp'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🏥 AI Health Assistant Server running on port ${PORT}`);
  console.log(`📞 To make a test call: curl -X POST ${process.env.NGROK_URL || 'http://localhost:' + PORT}/call`);
  console.log(`📱 To send test SMS: curl -X POST ${process.env.NGROK_URL || 'http://localhost:' + PORT}/send-sms`);
  console.log(`🤖 Features: Gemini AI + Bilingual Support (English/Hindi) + Voice + SMS`);
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