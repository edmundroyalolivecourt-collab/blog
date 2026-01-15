import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn('Gemini API key not found. AI features will be disabled.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface BlogGenerationOptions {
    topic: string;
    tone?: 'professional' | 'casual' | 'technical' | 'creative';
    length?: 'short' | 'medium' | 'long';
    includeIntro?: boolean;
    includeConclusion?: boolean;
}

export async function generateBlogContent(options: BlogGenerationOptions): Promise<string> {
    if (!ai) {
        throw new Error('Gemini API is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
    }

    const { topic, tone = 'professional', length = 'medium', includeIntro = true, includeConclusion = true } = options;

    // Determine word count based on length
    const wordCounts = {
        short: '300-500',
        medium: '800-1200',
        long: '1500-2000'
    };

    const prompt = `Write a ${tone} blog post about "${topic}".

Requirements:
- Word count: ${wordCounts[length]} words
- ${includeIntro ? 'Include an engaging introduction' : 'Start directly with the main content'}
- ${includeConclusion ? 'Include a thoughtful conclusion' : 'End with the main content'}
- Use clear semantic headers (h1, h2, h3) to structure the content effectively
- Make it informative and engaging
- Format the output in clean HTML with proper tags (h1, h2, h3, p, ul, li, strong, em)
- Focus on providing valuable insights and actionable information

Write the blog post now:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || '';
    } catch (error: any) {
        console.error('Error generating blog content:', error);
        throw new Error(`Failed to generate content: ${error.message || 'Unknown error'}`);
    }
}

export async function generateBlogTitle(topic: string): Promise<string> {
    if (!ai) {
        throw new Error('Gemini API is not configured.');
    }

    const prompt = `Generate a compelling, SEO-friendly blog post title for the topic: "${topic}". 
    
Requirements:
- Make it catchy and engaging
- Keep it under 60 characters
- Make it click-worthy but not clickbait
- Return ONLY the title, nothing else

Title:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
        });

        return response.text?.trim() || topic;
    } catch (error: any) {
        console.error('Error generating title:', error);
        return topic;
    }
}

export async function improveBlogContent(content: string, instruction: string): Promise<string> {
    if (!ai) {
        throw new Error('Gemini API is not configured.');
    }

    const prompt = `You are a professional blog editor. Here is a blog post:

${content}

Please improve it based on this instruction: "${instruction}"

Return the improved version in HTML format, maintaining the same structure but with the requested improvements.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
        });

        return response.text || content;
    } catch (error: any) {
        console.error('Error improving content:', error);
        throw new Error(`Failed to improve content: ${error.message || 'Unknown error'}`);
    }
}
