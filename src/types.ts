export interface WikipediaThumbnail {
  source: string;
  width: number;
  height: number;
}

export interface WikipediaData {
  title: string;
  extract: string;
  description?: string;
  pageUrl: string;
  thumbnail?: WikipediaThumbnail;
  relatedTopics?: string[];
  lang: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  wikipediaData?: WikipediaData;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface UserSettings {
  preserveHistory: boolean;
  language: string;
  theme: 'dark' | 'light' | 'system';
  fontSize: 'normal' | 'large';
}
