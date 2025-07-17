import { GoogleGenerativeAI } from '@fuyun/generative-ai'
import type { APIRoute } from 'astro'
import type { MedicalPresentation, PresentationSlide } from '@/types'
import { getKnowledgeForTopic } from '@/utils/medicalKnowledge'

const apiKey = import.meta.env.GEMINI_API_KEY
const apiBaseUrl = import.meta.env.API_BASE_URL?.trim().replace(/\/$/, '')

const genAI = apiBaseUrl
  ? new GoogleGenerativeAI(apiKey, apiBaseUrl)
  : new GoogleGenerativeAI(apiKey)

const sitePassword = import.meta.env.SITE_PASSWORD || ''
const passList = sitePassword.split(',') || []

export const post: APIRoute = async(context) => {
  try {
    const body = await context.request.json()
    const { prompt, topic, duration, language, pass } = body

    // Check password if required
    if (sitePassword && !(sitePassword === pass || passList.includes(pass))) {
      return new Response(JSON.stringify({
        error: {
          message: 'Invalid password.',
        },
      }), { status: 401 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Get relevant medical knowledge for the topic
    const relevantKnowledge = getKnowledgeForTopic(topic)

    // Enhanced prompt for medical presentation generation
    const medicalPrompt = `你是一位专业的生殖医学专家和生物伦理学家，拥有丰富的临床经验和学术背景。请根据以下要求生成一个高质量的医学演示文稿：

${prompt}

专业知识库参考（请基于这些数据生成内容）：
${JSON.stringify(relevantKnowledge, null, 2)}

请特别注意：
1. 引用最新的医学文献（2019-2024年），优先选择高影响因子期刊
2. 包含具体的临床数据和统计信息（参考知识库中的统计数据）
3. 分析国际指南和专家共识（参考知识库中的指南信息）
4. 考虑不同文化背景下的伦理差异（参考知识库中的伦理考量）
5. 提供实用的临床决策建议
6. 确保所有数据和引用的准确性

生成的内容应该科学严谨，符合循证医学原则。请以JSON格式返回，包含以下结构：

{
  "title": "演示文稿标题",
  "author": "生殖医学专家",
  "topic": "${topic}",
  "totalDuration": ${duration},
  "language": "${language}",
  "created": "${new Date().toISOString()}",
  "slides": [
    {
      "title": "幻灯片标题",
      "content": "详细内容，包含要点、数据、案例分析等",
      "type": "title|content|section|conclusion",
      "references": [
        {
          "title": "文献标题",
          "authors": ["作者1", "作者2"],
          "journal": "期刊名称",
          "year": 2024,
          "doi": "10.xxx/xxx",
          "pmid": "PMID编号"
        }
      ],
      "notes": "演讲备注和关键提示"
    }
  ]
}

请确保每张幻灯片内容丰富，包含3-5个关键要点，并提供相应的参考文献支持。`

    const result = await model.generateContent(medicalPrompt)
    const response = await result.response
    const text = response.text()

    // Try to extract JSON from the response
    let presentationData: MedicalPresentation
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        presentationData = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, create a structured response from the text
        presentationData = parseTextToPresentation(text, topic, duration, language)
      }
    } catch (parseError) {
      console.error('JSON parsing failed, creating fallback presentation')
      presentationData = parseTextToPresentation(text, topic, duration, language)
    }

    return new Response(JSON.stringify({
      presentation: presentationData,
      success: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating medical presentation:', error)
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to generate medical presentation. Please try again.',
        details: error.message,
      },
    }), { status: 500 })
  }
}

function parseTextToPresentation(text: string, topic: string, duration: number, language: 'zh' | 'en'): MedicalPresentation {
  // Parse the text response into a structured presentation
  const lines = text.split('\n').filter(line => line.trim())
  const slides: PresentationSlide[] = []

  let currentSlide: Partial<PresentationSlide> | null = null
  let currentContent: string[] = []

  // Create title slide
  slides.push({
    title: topic,
    content: `欢迎参加关于"${topic}"的专业讲座。\n\n本次演讲将深入探讨相关的医学理论、临床实践和伦理考量。`,
    type: 'title',
    notes: '介绍演讲主题和目标',
  })

  for (const line of lines) {
    // Check if this is a section header
    if (line.match(/^(#+\s*|\d+\.\s*|[一二三四五六七八九十]+[、.])/)) {
      // Save previous slide if exists
      if (currentSlide && currentContent.length > 0) {
        currentSlide.content = currentContent.join('\n')
        slides.push(currentSlide as PresentationSlide)
      }

      // Start new slide
      currentSlide = {
        title: line.replace(/^(#+\s*|\d+\.\s*|[一二三四五六七八九十]+[、.])/, '').trim(),
        type: 'content',
        references: [],
      }
      currentContent = []
    } else if (line.trim() && currentSlide) {
      currentContent.push(line.trim())
    }
  }

  // Add the last slide
  if (currentSlide && currentContent.length > 0) {
    currentSlide.content = currentContent.join('\n')
    slides.push(currentSlide as PresentationSlide)
  }

  // Add conclusion slide
  slides.push({
    title: '总结与展望',
    content: `通过本次演讲，我们深入探讨了${topic}的各个方面。\n\n希望这些内容能够为临床实践和研究提供有价值的参考。\n\n感谢大家的参与和讨论！`,
    type: 'conclusion',
    notes: '总结要点，提出未来研究方向',
  })

  return {
    title: topic,
    author: '医学专家',
    topic,
    slides,
    totalDuration: duration,
    language,
    created: new Date(),
  }
}
