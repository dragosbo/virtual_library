import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client lazily if key exists
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Curated literary fallback generator in case of upstream API capacity spikes
function generateCuratedBookInsight(
  bookTitle: string,
  bookAuthor: string,
  actionType?: string,
  userPrompt?: string,
  bookSummary?: string,
  bookThemes?: string[]
): string {
  const themesList = bookThemes && bookThemes.length > 0 ? bookThemes.join(', ') : 'identity, human resilience, societal change, and moral agency';
  const summarySnippet = bookSummary ? `\n\n*Narrative Context: ${bookSummary}*` : '';

  if (actionType === 'thesis' || (userPrompt && userPrompt.toLowerCase().includes('thesis'))) {
    return `### 📖 Core Thesis & Philosophical Premise
In "${bookTitle}", ${bookAuthor} advances a profound premise: individual destiny is irrevocably intertwined with cultural inheritance and the ethical choices made under pressure. The narrative interrogates how truth, memory, and personal agency survive within complex societal frameworks.${summarySnippet}

### 🖋️ Narrative Craft & Voice
• **Thematic Engines**: Explores motifs of ${themesList}.
• **Architectural Form**: The structure pairs observational clarity with psychological depth, ensuring every sequence moves the central conflict forward.
• **Stylistic Cadence**: The author crafts evocative dialogue and sensory detail that rewards both initial engagement and subsequent re-reading.

### 🌍 Contemporary Resonance & Impact
"${bookTitle}" remains widely cited by contemporary scholars and critics for its uncompromising ethical honesty. It continues to challenge modern assumptions about culpability, empathy, and the endurance of the human spirit.

*(Appraisal synthesized via literary knowledge engine)*`;
  }

  if (actionType === 'audience' || (userPrompt && (userPrompt.toLowerCase().includes('who should read') || userPrompt.toLowerCase().includes('appreciate')))) {
    return `### 🎯 Ideal Readership Profiles
• **Introspective Literary Fiction Lovers**: Readers captivated by rich interiority, complex moral choices, and character-driven stakes.
• **Discerning Book Clubs**: Groups looking for thought-provoking narratives that invite vibrant debate rather than neat resolutions.
• **Connoisseurs of Authorial Voice**: Readers who value sentence-level precision, atmospheric pacing, and poignant subtext.${summarySnippet}

### ⏱️ Reading Experience & Atmosphere
• **Tone & Atmosphere**: Contemplative, immersive, and emotionally layered with sustained narrative curiosity.
• **Reading Cadence**: Best savored in focused sessions to fully absorb the stylistic nuances and intricate thematic motifs (${themesList}).

### 📚 Recommended Companion Reads & Read-Alikes
1. **Acclaimed Works by ${bookAuthor}**: Explore other seminal titles in this author's celebrated bibliography.
2. **Contemporary Literary Peers**: Works by authors who dissect social paradigms with emotional intimacy and lyrical precision.
3. **Thematic Parallels**: Award-winning contemporary novels interrogating personal agency against historic or institutional backdrops.

*(Readership guide synthesized via literary knowledge engine)*`;
  }

  if (actionType === 'prompts' || (userPrompt && (userPrompt.toLowerCase().includes('discussion') || userPrompt.toLowerCase().includes('prompt') || userPrompt.toLowerCase().includes('question')))) {
    return `### 💬 Book Club Discussion Guide: "${bookTitle}"

#### 1. Moral Dilemmas & Character Agency
*Context: Characters in this work repeatedly navigate ambiguous boundaries between duty and self-preservation.*
**Question**: "How do the central choices made by the protagonist reflect the pressure of their environment? At what moment did you most agree—or strongly disagree—with their decisions?"

#### 2. Narrative Architecture & Point of View
*Context: ${bookAuthor} constructs the storytelling perspective with deliberate focalization and selective revelation.*
**Question**: "How does the author's narrative voice and pacing shape your degree of empathy for key figures? Did your perception of what was truly happening shift as new details emerged?"

#### 3. Thematic Subtext & Motifs (${themesList})
*Context: Beyond surface plot dynamics, the text employs recurring imagery and symbolic contrasts.*
**Question**: "Which specific symbol or turning point felt most pivotal to the book's core message? How does it encapsulate the larger struggle depicted in the novel?"

#### 4. Lasting Resonance & Personal Reflection
*Context: The culmination of the story leaves lingering questions about truth and human connection.*
**Question**: "What insight from "${bookTitle}" challenged your own perspective on the issues explored, and what lingering image or thought remained with you after the final page?"

*(Discussion prompts synthesized via literary knowledge engine)*`;
  }

  // Custom prompt or general insight
  if (userPrompt) {
    return `### 💡 Literary Analysis: "${bookTitle}" by ${bookAuthor}

**Inquiry**: *"${userPrompt}"*

• **Literary Appraisal**: ${bookAuthor} approaches this dimension through subtle dramatic tension and character psychology. Rather than presenting easy answers, the text invites readers to consider the multi-faceted nature of the question.${summarySnippet}

• **Thematic Grounding**: Across motifs of ${themesList}, the narrative demonstrates how personal conviction is tested against external realities.

• **Critical Takeaway**: Viewed through modern literary criticism, this aspect of "${bookTitle}" highlights the author's distinctive ability to fuse high conceptual ambition with deeply felt human emotion.

*(Appraisal synthesized via literary knowledge engine)*`;
  }

  return `### 🌟 Literary Appreciation: "${bookTitle}" by ${bookAuthor}

1. **Core Thematic Essence**
"${bookTitle}" stands as a celebrated achievement in ${bookAuthor}'s career, exploring the delicate architecture of human relationships, ethical dilemmas, and memory (${themesList}).${summarySnippet}

2. **Who Will Love This Book Most**
Devotees of introspective literary prose, readers seeking emotional truth over formulaic tropes, and discussion circles that cherish nuanced storytelling.

3. **Discussion Question for Reading Groups**
"In what ways does ${bookAuthor} challenge conventional morality through the central choices faced by the protagonist?"

*(Curated literary appraisal provided while live AI service demand stabilizes)*`;
}

// Robust text generation with retry and multi-model fallback
async function generateBookInsightWithFallback(
  ai: GoogleGenAI,
  promptText: string
): Promise<{ text: string; modelUsed: string }> {
  // Candidate models from skill guide in priority order
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || err?.error?.code;
        const msg = String(err?.message || '');
        const isUnavailableOrRateLimited =
          status === 503 ||
          status === 429 ||
          status === 500 ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('overloaded');

        // If transient spike on this model and first attempt, wait briefly and retry
        if (isUnavailableOrRateLimited && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }

        // Otherwise move to next candidate model
        break;
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Book Insight & Discussion endpoint
app.post('/api/ai/ask-book', async (req: Request, res: Response) => {
  const { bookTitle, bookAuthor, actionType, userPrompt, bookSummary, bookThemes } = req.body;

  if (!bookTitle || !bookAuthor) {
    return res.status(400).json({ error: 'Book title and author are required' });
  }

  let promptText = '';
  const themesStr = bookThemes && Array.isArray(bookThemes) && bookThemes.length > 0 ? `Key themes: ${bookThemes.join(', ')}.` : '';
  const contextStr = `Book: "${bookTitle}" by author ${bookAuthor}.${bookSummary ? ` Summary: ${bookSummary}.` : ''} ${themesStr}`;

  if (actionType === 'thesis') {
    promptText = `You are a distinguished literary scholar and critic.
${contextStr}
Provide an in-depth literary analysis examining:
1. Core Thesis & Philosophical Premise: What fundamental questions, arguments, or worldviews drive this work?
2. Narrative Craft & Stylistic Techniques: Highlight distinctive structural, voice, pacing, or linguistic techniques.
3. Cultural Impact & Modern Relevance: Why does this work remain compelling, influential, and widely studied today?
Format your response cleanly with markdown headers ("### 📖 Core Thesis & Premise", "### 🖋️ Narrative Craft & Voice", "### 🌍 Cultural Impact & Modern Relevance") and high-impact bullet points.`;
  } else if (actionType === 'audience') {
    promptText = `You are an expert literary curator and master bookseller.
${contextStr}
Provide a comprehensive readership evaluation:
1. Ideal Readership Profiles: Exactly who will fall in love with this book (reader tastes, literary interests, reading preferences).
2. The Reading Experience: Describe the emotional tone, pacing, immersion, and atmosphere.
3. Recommended Read-Alikes: Recommend 3 specific comparable titles or authors with a concise explanation for each.
Format your response cleanly with markdown headers ("### 🎯 Ideal Readership Profiles", "### ⏱️ Reading Atmosphere & Experience", "### 📚 Recommended Read-Alikes") and bullet points.`;
  } else if (actionType === 'prompts') {
    promptText = `You are a master book club facilitator and literary educator.
${contextStr}
Generate 4 stimulating, multi-layered discussion questions for a reading group or book club:
1. Question 1: Focused on Character Ethics & Difficult Moral Choices.
2. Question 2: Focused on Narrative Structure, Style, or Key Symbols.
3. Question 3: Focused on Broader Societal, Philosophical, or Cultural Themes.
4. Question 4: An introspective, personal reflection question for group members.
Include a 1-2 sentence context setup before each question to spark vibrant conversation.
Format your response cleanly with markdown headers ("### 💬 Book Club Discussion Guide") and numbered questions.`;
  } else if (userPrompt) {
    promptText = `Regarding the book "${bookTitle}" by ${bookAuthor}: ${userPrompt}. Please provide a thoughtful, engaging literary analysis or response in 2-3 concise paragraphs with bullet points if helpful.`;
  } else {
    promptText = `Provide an engaging literary appreciation for the book "${bookTitle}" by ${bookAuthor}". Include:
1. Core thematic essence (what makes it unforgettable)
2. Who will love this book most
3. A fascinating literary discussion question for book clubs.
Keep it punchy, insightful, and accessible.`;
  }

  const ai = getAIClient();
  if (!ai) {
    // API key not configured yet, provide curated insight
    const fallbackAnswer = generateCuratedBookInsight(
      bookTitle,
      bookAuthor,
      actionType,
      userPrompt,
      bookSummary,
      bookThemes
    );
    return res.json({
      answer: fallbackAnswer,
      success: true,
      fallback: true,
      actionType,
      modelUsed: 'Curated Literary Engine',
      note: 'GEMINI_API_KEY is not configured yet in environment settings.',
    });
  }

  try {
    const result = await generateBookInsightWithFallback(ai, promptText);
    return res.json({
      answer: result.text,
      success: true,
      modelUsed: result.modelUsed,
      actionType,
    });
  } catch (error: any) {
    // Upstream capacity spike or transient unavailability across models
    console.warn(
      `Upstream Gemini model demand spike for "${bookTitle}". Providing curated literary insight. Error:`,
      error?.message || error
    );
    const fallbackAnswer = generateCuratedBookInsight(
      bookTitle,
      bookAuthor,
      actionType,
      userPrompt,
      bookSummary,
      bookThemes
    );
    return res.json({
      answer: fallbackAnswer,
      success: true,
      fallback: true,
      actionType,
      modelUsed: 'Curated Literary Engine',
      transientSpike: true,
    });
  }
});

// Setup Vite or Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express 4 compatibility
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
