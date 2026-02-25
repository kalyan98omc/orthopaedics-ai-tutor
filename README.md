# Orthopedics AI Tutor - NEET PG

Intelligent teaching system with natural conversation flow and competency-based progression.

## Features

✅ **AI-Powered Teaching** - Uses Claude API for Socratic teaching
✅ **Competency-Based** - Only moves forward when student demonstrates understanding
✅ **Structured Learning** - SAQ → Mixed Practice → MCQ progression
✅ **Progress Tracking** - Visual progress bars and phase indicators
✅ **No CORS Issues** - Hosted properly, works everywhere
✅ **Mobile Responsive** - Works on all devices

## Quick Deploy to Vercel (FREE!)

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to project folder**
   ```bash
   cd ortho-app
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Login to Vercel
   - Set up project
   - Deploy!

5. **Get your live URL** (e.g., `orthopedics-ai.vercel.app`)

### Option 2: Using Vercel Website

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Click "Import Git Repository" or drag the `ortho-app` folder
4. Click "Deploy"
5. Done! Get your live URL

## How Students Use It

1. Visit your Vercel URL
2. Enter Anthropic API key (one-time setup)
3. Select topic (Colles Fracture)
4. Start learning with AI tutor!

## API Key Setup

Students need their own Anthropic API key:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (free)
3. Create API key
4. Cost: ~₹10-20 per intensive study session

## Folder Structure

```
ortho-app/
├── index.html       # Main HTML
├── styles.css       # Styling
├── app.js           # Application logic
├── vercel.json      # Vercel config (CORS fix)
└── README.md        # This file
```

## Adding More Topics

Edit `app.js` → `curriculum` object:

```javascript
'New Topic Name': {
    saqs: [
        "Question 1...",
        "Question 2...",
        // ... up to 4-5 SAQs
    ],
    mixed: [
        {t: 'LAQ', q: "Long answer question..."},
        {t: 'SAQ', q: "Short answer..."},
        {t: 'MCQ', q: "MCQ question?", o: ["A)", "B)", "C)", "D)"], a: 'B'}
    ],
    mcqs: [
        {q: "MCQ 1?", o: ["A)", "B)", "C)"], a: 'A'},
        // ... 2-3 MCQs
    ]
}
```

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **API**: Anthropic Claude Sonnet 4
- **Hosting**: Vercel (free tier)
- **No backend needed!**

## Customization

### Change Colors
Edit `styles.css` → gradient colors

### Change AI Model
Edit `app.js` → `model:` parameter

### Adjust Teaching Style
Edit `app.js` → system prompts in `startSAQ()` and `buildPrompt()`

## Support

For issues, check:
1. API key is valid
2. Browser console for errors
3. Anthropic account has credits

## License

MIT - Use freely for NEET PG preparation!
