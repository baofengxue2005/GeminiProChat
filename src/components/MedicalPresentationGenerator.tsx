import { Show, createSignal } from 'solid-js'
import type { MedicalPresentation } from '@/types'

export default () => {
  const [topic, setTopic] = createSignal('')
  const [outline, setOutline] = createSignal('')
  const [presentation, setPresentation] = createSignal<MedicalPresentation | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal('')
  const [language, setLanguage] = createSignal<'zh' | 'en'>('zh')
  const [duration, setDuration] = createSignal(30)

  const fertilitPreservationTemplate = `
青少年生育力保存的伦理与技术考量

大纲结构：
1. 引言与案例 (1-2分钟)
2. 背景与流行病学 (3-5分钟)  
3. 性腺发育生理 (5-8分钟)
4. 技术路线与方法 (7-10分钟)
5. 当前挑战与进展 (5-8分钟)
6. 伦理问题分析 (5-8分钟)
7. 知情同意流程 (7-10分钟)
8. 政策现状对比 (3-5分钟)
9. 总结与展望 (2-3分钟)

请为每个部分生成详细内容，包括：
- 关键数据和统计信息
- 最新研究进展（2019-2024年）
- 国际标准和指南
- 具体的伦理考量
- 临床实践建议
`

  const generatePresentation = async() => {
    if (!topic().trim()) return

    setLoading(true)
    setError('')

    try {
      const prompt = `作为生殖医学和生物伦理学专家，请基于以下主题创建一个专业的医学演示文稿：

主题: ${topic()}
时长: ${duration()}分钟
语言: ${language() === 'zh' ? '中文' : 'English'}

${outline() || fertilitPreservationTemplate}

请生成一个结构化的演示文稿，包含：
1. 每张幻灯片的标题和详细内容
2. 关键数据点和统计信息
3. 最新研究文献引用（2019-2024年）
4. 临床案例和实践建议
5. 伦理考量和政策分析

返回格式为JSON，包含slides数组，每个slide包含title, content, type, references字段。`

      const response = await fetch('/api/medical-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          topic: topic(),
          duration: duration(),
          language: language(),
          timestamp: Date.now(),
        }),
      })

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json()
      setPresentation(result.presentation)
    } catch (err) {
      console.error('Error generating presentation:', err)
      setError('生成演示文稿时出现错误，请重试。')
    } finally {
      setLoading(false)
    }
  }

  const exportToMarkdown = () => {
    if (!presentation()) return

    const p = presentation()!
    let markdown = `# ${p.title}\n\n`
    markdown += `**作者**: ${p.author}\n`
    markdown += `**主题**: ${p.topic}\n`
    markdown += `**时长**: ${p.totalDuration}分钟\n\n`

    p.slides.forEach((slide, index) => {
      if (slide.type === 'title')
        markdown += `## ${slide.title}\n\n${slide.content}\n\n`
      else if (slide.type === 'section')
        markdown += `## ${index + 1}. ${slide.title}\n\n${slide.content}\n\n`
      else
        markdown += `### ${slide.title}\n\n${slide.content}\n\n`

      if (slide.references && slide.references.length > 0) {
        markdown += '**参考文献：**\n\n'
        slide.references.forEach((ref) => {
          markdown += `- ${ref.authors.join(', ')}. ${ref.title}. *${ref.journal}*. ${ref.year}.`
          if (ref.doi) markdown += ` DOI: ${ref.doi}`
          markdown += '\n'
        })
        markdown += '\n'
      }
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${p.title.replace(/[^a-zA-Z0-9\u4E00-\u9FA5]/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">医学演示文稿生成器</h2>
        <p class="text-gray-600 mb-4">
          专业的医学演示文稿生成工具，支持生育力保存、生殖医学等主题，包含最新研究文献和伦理分析。
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">演示语言</label>
            <select
              value={language()}
              onInput={e => setLanguage(e.target.value as 'zh' | 'en')}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">演示时长 (分钟)</label>
            <input
              type="number"
              value={duration()}
              onInput={e => setDuration(parseInt(e.target.value) || 30)}
              min="10"
              max="120"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预设模板</label>
            <button
              onClick={() => {
                setTopic('青少年生育力保存的伦理与技术考量')
                setOutline(fertilitPreservationTemplate)
              }}
              class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              生育力保存模板
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">演示主题</label>
          <input
            type="text"
            value={topic()}
            onInput={e => setTopic(e.target.value)}
            placeholder="请输入演示主题，如：青少年生育力保存的伦理与技术考量"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">详细大纲 (可选)</label>
          <textarea
            value={outline()}
            onInput={e => setOutline(e.target.value)}
            placeholder="请输入详细的演示大纲，包括各章节要点..."
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex gap-3">
          <button
            onClick={generatePresentation}
            disabled={loading() || !topic().trim()}
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading() ? '生成中...' : '生成演示文稿'}
          </button>

          <Show when={presentation()}>
            <button
              onClick={exportToMarkdown}
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              导出Markdown
            </button>
          </Show>
        </div>
      </div>

      <Show when={error()}>
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error()}
        </div>
      </Show>

      <Show when={presentation()}>
        <div class="bg-white border rounded-lg shadow-sm">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold text-gray-800">{presentation()!.title}</h3>
            <p class="text-gray-600 mt-1">
              共 {presentation()!.slides.length} 张幻灯片 • 预计时长: {presentation()!.totalDuration} 分钟
            </p>
          </div>

          <div class="divide-y">
            {presentation()!.slides.map((slide, index) => (
              <div key={`slide-${index}-${slide.title}`} class="p-6">
                <div class="flex items-center gap-3 mb-3">
                  <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    第 {index + 1} 张
                  </div>
                  <div class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {slide.type === 'title'
                      ? '标题页'
                      : slide.type === 'section'
                        ? '章节页'
                        : slide.type === 'conclusion' ? '结论页' : '内容页'}
                  </div>
                </div>

                <h4 class="text-lg font-semibold text-gray-800 mb-3">{slide.title}</h4>

                <div class="prose max-w-none text-gray-700 mb-4" innerHTML={slide.content.replace(/\n/g, '<br>')} />

                <Show when={slide.references && slide.references.length > 0}>
                  <div class="bg-gray-50 p-4 rounded-md">
                    <h5 class="text-sm font-medium text-gray-800 mb-2">参考文献:</h5>
                    <div class="space-y-1">
                      {slide.references!.map((ref, refIndex) => (
                        <div key={`ref-${refIndex}-${ref.title}`} class="text-xs text-gray-600">
                          {ref.authors.join(', ')}. {ref.title}. <em>{ref.journal}</em>. {ref.year}.
                          {ref.doi && <span class="ml-1">DOI: {ref.doi}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </Show>

                <Show when={slide.notes}>
                  <div class="mt-3 text-sm text-gray-500 italic">
                    演讲备注: {slide.notes}
                  </div>
                </Show>
              </div>
            ))}
          </div>
        </div>
      </Show>
    </div>
  )
}
