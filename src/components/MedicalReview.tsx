import { createSignal, For, Show } from 'solid-js'

interface Reference {
  id: string
  authors: string
  title: string
  journal: string
  year: number
  pmid?: string
  doi?: string
  verified: boolean
}

interface PresentationSection {
  id: string
  title: string
  content: string
  timeAllocation: string
  references: Reference[]
  hasErrors: boolean
  corrections: string[]
}

const presentationSections: PresentationSection[] = [
  {
    id: 'introduction',
    title: '1. 引言（1 min）',
    content: `破冰案例：14 岁急性白血病女孩，化疗前 24 h 紧急冷冻卵巢组织——父母、医生、伦理委员会三方如何决策？

抛出核心问题：技术可行 ≠ 伦理可行；知情同意 ≠ 真正"知情"。`,
    timeAllocation: '1 min',
    references: [],
    hasErrors: false,
    corrections: []
  },
  {
    id: 'background',
    title: '2. 背景与流行病学（3 min）',
    content: `2.1 青少年癌症 5 年生存率>85%，但性腺毒性治疗使>30%面临不育。
2.2 非肿瘤适应证：DSD、Turner综合征、SMA、β-地中海贫血、跨性别激素治疗等。

修正：根据最新流行病学数据，青少年癌症患者5年生存率在发达国家已达到83-87%，其中急性淋巴细胞白血病超过90%。但接受性腺毒性治疗（如烷化剂、盆腔放疗）的患者中，约40-60%面临生育功能损害风险。`,
    timeAllocation: '3 min',
    references: [],
    hasErrors: true,
    corrections: [
      '青少年癌症5年生存率需要更新的统计数据，应引用2020-2024年最新癌症登记数据',
      '生育功能损害比例需要按治疗类型细分，引用最新meta分析',
      '非肿瘤适应证需要补充Turner综合征等遗传性疾病的最新指南'
    ]
  },
  {
    id: 'physiology',
    title: '3. 性腺发育的生理：从胚胎到青春期（5 min）',
    content: `3.1 男性
• 6–8 周胎龄：原始生殖细胞（PGC）迁入未分化性腺；
• 0–6 岁：精原干细胞（SSCs）仅处于有丝分裂期；
• 9–14 岁：Tanner II–III，睾酮↑→初级精母细胞出现，首次出现单倍体圆形精子细胞（late spermatid）≈12.5 岁；
• 15–18 岁：Tanner IV–V，精子浓度≥15×10^6/mL（WHO 2010标准）方可常规冷冻。

3.2 女性
• 20 周胎龄：卵原细胞减数分裂→始基卵泡池约1-2×10^6；
• 0–8 岁：卵泡池持续闭锁，数量降至约30万；
• 9–14 岁：FSH脉冲出现→初级卵泡→次级卵泡，卵巢体积4–8 mL；
• 15–18 岁：优势卵泡可达16–20 mm，首次排卵。

3.3 关键生理差异决定技术窗口
• 男性：SSC体外分化尚未临床化→青春期前只能用"组织级"策略；
• 女性：始基卵泡可耐受冷冻→青春期前后均可OTC，但刺激卵泡需雌激素环境。`,
    timeAllocation: '5 min',
    references: [],
    hasErrors: true,
    corrections: [
      '始基卵泡数量修正：20周胎龄约1-2×10^6，出生时约1×10^6，青春期前降至约30万',
      '精子浓度标准已更新为WHO 2010标准：≥15×10^6/mL',
      '发育里程碑时间点需要更精确的参考文献，特别是圆形精子细胞出现时间'
    ]
  }
]

export default function MedicalReview() {
  const [currentSection, setCurrentSection] = createSignal(0)
  const [searchQuery, setSearchQuery] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)
  const [references, setReferences] = createSignal<Reference[]>([])

  const searchReferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/search-references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery(),
          section: presentationSections[currentSection()].id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const formattedReferences: Reference[] = data.references.map((ref: any) => ({
          id: ref.pmid,
          authors: ref.authors,
          title: ref.title,
          journal: ref.journal,
          year: ref.year,
          pmid: ref.pmid,
          doi: ref.doi,
          verified: true
        }))
        
        setReferences(formattedReferences)
      }
    } catch (error) {
      console.error('Error searching references:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSection = () => {
    if (currentSection() < presentationSections.length - 1) {
      setCurrentSection(currentSection() + 1)
      setReferences([])
    }
  }

  const prevSection = () => {
    if (currentSection() > 0) {
      setCurrentSection(currentSection() - 1)
      setReferences([])
    }
  }

  const currentSectionData = () => presentationSections[currentSection()]

  return (
    <div class="medical-review-container">
      <div class="header-section">
        <h1 class="main-title">Medical Literature Review</h1>
        <h2 class="subtitle">青少年生育力保存的技术与伦理问题专题讲座</h2>
        
        <div class="navigation-controls">
          <button 
            class="nav-btn"
            onClick={prevSection}
            disabled={currentSection() === 0}
          >
            ← 上一节
          </button>
          
          <span class="section-counter">
            {currentSection() + 1} / {presentationSections.length}
          </span>
          
          <button 
            class="nav-btn"
            onClick={nextSection}
            disabled={currentSection() === presentationSections.length - 1}
          >
            下一节 →
          </button>
        </div>
      </div>

      <div class="content-area">
        <div class="section-header">
          <h3 class="section-title">{currentSectionData().title}</h3>
          <div class="section-meta">
            <span class="time-allocation">时长: {currentSectionData().timeAllocation}</span>
            <Show when={currentSectionData().hasErrors}>
              <span class="error-indicator">⚠️ 需要修正</span>
            </Show>
          </div>
        </div>

        <div class="section-content">
          <div class="content-display">
            <h4>内容:</h4>
            <div class="content-text">
              <For each={currentSectionData().content.split('\n')}>
                {(line) => <p>{line}</p>}
              </For>
            </div>
          </div>

          <Show when={currentSectionData().hasErrors && currentSectionData().corrections.length > 0}>
            <div class="corrections-section">
              <h4>需要修正的问题:</h4>
              <ul class="corrections-list">
                <For each={currentSectionData().corrections}>
                  {(correction) => <li class="correction-item">{correction}</li>}
                </For>
              </ul>
            </div>
          </Show>

          <div class="references-section">
            <div class="references-header">
              <h4>参考文献 ({references().length})</h4>
              <div class="search-controls">
                <input 
                  type="text" 
                  class="search-input"
                  placeholder="输入搜索关键词..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                />
                <button 
                  class="search-btn"
                  onClick={searchReferences}
                  disabled={isLoading()}
                >
                  {isLoading() ? '搜索中...' : '搜索PubMed'}
                </button>
              </div>
            </div>

            <Show when={references().length > 0}>
              <div class="references-list">
                <For each={references()}>
                  {(ref) => (
                    <div class="reference-item">
                      <div class="reference-content">
                        <div class="reference-text">
                          {ref.authors} {ref.title}. <em>{ref.journal}</em>. {ref.year}.
                        </div>
                        <div class="reference-meta">
                          <Show when={ref.pmid}>
                            <span class="pmid">PMID: {ref.pmid}</span>
                          </Show>
                          <Show when={ref.doi}>
                            <span class="doi">DOI: {ref.doi}</span>
                          </Show>
                          <span class={`verification-status ${ref.verified ? 'verified' : 'unverified'}`}>
                            {ref.verified ? '✓ 已验证' : '⚠️ 待验证'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn export-btn">
          导出修正版本
        </button>
        <button class="action-btn validate-btn">
          验证所有引用
        </button>
        <button class="action-btn translate-btn">
          英文翻译
        </button>
      </div>
    </div>
  )
}