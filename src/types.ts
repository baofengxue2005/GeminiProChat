export interface ChatPart {
  text: string
}

export interface ChatMessage {
  role: 'model' | 'user'
  parts: ChatPart[]
}

export interface ErrorMessage {
  code: string
  message: string
}

export interface MedicalReference {
  title: string
  authors: string[]
  journal: string
  year: number
  doi?: string
  pmid?: string
  url?: string
}

export interface PresentationSlide {
  title: string
  content: string
  type: 'title' | 'content' | 'section' | 'conclusion'
  references?: MedicalReference[]
  imageUrl?: string
  notes?: string
}

export interface MedicalPresentation {
  title: string
  author: string
  topic: string
  slides: PresentationSlide[]
  totalDuration?: number
  language: 'zh' | 'en'
  created: Date
}
