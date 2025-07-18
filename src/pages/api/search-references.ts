import type { APIRoute } from 'astro'

interface PubMedReference {
  pmid: string
  title: string
  authors: string
  journal: string
  year: number
  doi?: string
  abstract?: string
}

// Mock PubMed data for fertility preservation research
const mockPubMedDatabase: PubMedReference[] = [
  {
    pmid: '34567890',
    title: 'Fertility preservation in adolescents and young adults with cancer: a systematic review and meta-analysis',
    authors: 'Smith J, Johnson A, Williams B, et al.',
    journal: 'Lancet Oncol',
    year: 2023,
    doi: '10.1016/S1470-2045(23)00234-5',
    abstract: 'Background: Cancer incidence in adolescents and young adults continues to rise...'
  },
  {
    pmid: '35123456',
    title: 'Ovarian tissue cryopreservation in prepubertal girls: recent advances and clinical outcomes',
    authors: 'Chen L, Rodriguez M, Kim S, et al.',
    journal: 'Hum Reprod',
    year: 2024,
    doi: '10.1093/humrep/deae045',
    abstract: 'Objective: To evaluate the efficacy and safety of ovarian tissue cryopreservation...'
  },
  {
    pmid: '33987654',
    title: 'Testicular tissue cryopreservation and transplantation: current status and future perspectives',
    authors: 'Anderson RA, Stukenborg JB, Schlatt S, et al.',
    journal: 'Andrology',
    year: 2023,
    doi: '10.1111/andr.13456',
    abstract: 'Background: Testicular tissue cryopreservation represents the only option...'
  },
  {
    pmid: '36456789',
    title: 'Fertility preservation techniques in pediatric and adolescent oncology: a comprehensive review',
    authors: 'Martinez C, Thompson K, Lee H, et al.',
    journal: 'Pediatr Blood Cancer',
    year: 2024,
    doi: '10.1002/pbc.30123',
    abstract: 'Introduction: With improving survival rates in pediatric cancers...'
  },
  {
    pmid: '37234567',
    title: 'Ethical considerations in fertility preservation for minors: a global perspective',
    authors: 'Jones R, Patel S, Brown M, et al.',
    journal: 'J Med Ethics',
    year: 2023,
    doi: '10.1136/medethics-2023-109876',
    abstract: 'Background: Fertility preservation in minors raises unique ethical challenges...'
  },
  {
    pmid: '38345678',
    title: 'Long-term outcomes of ovarian tissue transplantation: a 10-year follow-up study',
    authors: 'Nielsen K, Andersen CY, Greve T, et al.',
    journal: 'Fertil Steril',
    year: 2024,
    doi: '10.1016/j.fertnstert.2024.02.015',
    abstract: 'Objective: To assess long-term reproductive and endocrine outcomes...'
  },
  {
    pmid: '32654321',
    title: 'Spermatogonial stem cell transplantation: from bench to bedside',
    authors: 'Valli H, Phillips BT, Orwig KE, et al.',
    journal: 'Nat Rev Urol',
    year: 2022,
    doi: '10.1038/s41585-022-00598-z',
    abstract: 'Spermatogonial stem cell transplantation has emerged as a promising approach...'
  },
  {
    pmid: '39456781',
    title: 'In vitro activation of primordial follicles: recent advances and clinical applications',
    authors: 'Kawamura K, Cheng Y, Suzuki N, et al.',
    journal: 'Reproduction',
    year: 2024,
    doi: '10.1530/REP-24-0087',
    abstract: 'In vitro activation (IVA) of primordial follicles represents an innovative approach...'
  }
]

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query, section } = await request.json()
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Filter references based on query and section
    let filteredReferences = mockPubMedDatabase
    
    if (query) {
      const searchTerms = query.toLowerCase().split(' ')
      filteredReferences = mockPubMedDatabase.filter(ref => 
        searchTerms.some(term => 
          ref.title.toLowerCase().includes(term) || 
          ref.abstract?.toLowerCase().includes(term) ||
          ref.authors.toLowerCase().includes(term)
        )
      )
    }
    
    // Section-specific filtering
    if (section) {
      const sectionKeywords: { [key: string]: string[] } = {
        'background': ['cancer', 'survival', 'epidemiology', 'incidence'],
        'physiology': ['development', 'gonadal', 'puberty', 'tanner'],
        'technical-routes': ['cryopreservation', 'transplantation', 'tissue'],
        'technical-challenges': ['outcomes', 'challenges', 'complications'],
        'ethics': ['ethical', 'consent', 'minor', 'adolescent']
      }
      
      const keywords = sectionKeywords[section] || []
      if (keywords.length > 0) {
        filteredReferences = filteredReferences.filter(ref =>
          keywords.some(keyword =>
            ref.title.toLowerCase().includes(keyword) ||
            ref.abstract?.toLowerCase().includes(keyword)
          )
        )
      }
    }
    
    // Limit results
    const results = filteredReferences.slice(0, 10)
    
    return new Response(JSON.stringify({
      success: true,
      references: results,
      total: filteredReferences.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
  } catch (error) {
    console.error('Error searching references:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to search references'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}