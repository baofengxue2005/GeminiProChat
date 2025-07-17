export const fertilityPreservationKnowledge = {
  // Key statistics and epidemiology
  statistics: {
    cancerSurvival: {
      adolescent5YearSurvival: 85, // >85% 5-year survival rate
      infertilityRisk: 30, // >30% face infertility
      source: 'Pediatric Cancer Survivorship Research, 2023'
    },
    gonadDevelopment: {
      maleSpermConcentrationThreshold: 1e6, // 1×10^6/mL for routine freezing
      femaleFollicleCount: {
        at20Weeks: 700000, // 6-7×10^5 at 20 weeks gestation
        at8Years: 300000, // 3×10^5 at 0-8 years
        ovarianVolume: [4, 8], // 4-8 mL during 9-14 years
      }
    }
  },

  // Technical approaches and success rates
  techniques: {
    male: {
      postPubertal: {
        method: 'Conventional/micro-sperm freezing',
        futureUse: 'ICSI (Intracytoplasmic Sperm Injection)',
        successRate: 'Standard fertility rates'
      },
      prePubertal: {
        method: 'Testicular tissue thin-slice freezing (0.5-1 cm³)',
        futureOptions: [
          'Autologous transplantation (SSC re-seeding)',
          'In vitro spermatogenesis + ROSI (Round Spermatid Injection)'
        ],
        challenges: 'SSC in vitro meiosis efficiency <5%'
      }
    },
    female: {
      postPubertal: {
        method: 'Random start or antagonist protocol COS → oocyte/embryo freezing',
        successRate: 'Standard IVF success rates'
      },
      universal: {
        method: 'OTC (Laparoscopic cortical strip)',
        futureOptions: [
          'Orthotopic transplantation',
          'Artificial ovary (fibrin-thrombin scaffold + follicles)',
          'In vitro activation (IVA) + IVM'
        ],
        challenges: {
          ivaSuccessRate: '30-40% follicle survival, <10% live birth rate',
          malignancyRisk: 'Risk of malignant cell reintroduction (leukemia/lymphoma)'
        }
      }
    }
  },

  // Current research advances (2019-2024)
  recentAdvances: {
    cryopreservation: {
      technique: 'VS55/DP6 vitrification',
      ovarianTissueSurvival: 90,
      year: 2023,
      source: 'Reproductive BioMedicine Online'
    },
    maleSpermatogenesis: {
      bmp4RAInduction: {
        efficiency: 15, // 28 days to reach 15%
        previousEfficiency: 5,
        year: 2024,
        source: 'Nature Cell Biology'
      }
    },
    threeDPrinting: {
      technique: '3D printed testicular/ovarian scaffolds',
      status: 'Animal experiments',
      year: 2023
    }
  },

  // Ethics and consent considerations
  ethics: {
    ageGroups: {
      '0-9': 'Parental proxy consent + mandatory ethics committee review',
      '10-13': 'Child assent (comic/AR assisted)',
      '14-17': 'Shared decision-making + mature minor clauses (can sign dynamic consent independently)'
    },
    keyConsiderations: [
      'Technical feasibility ≠ ethical feasibility',
      'Informed consent ≠ truly "informed"',
      'Future use scenarios unpredictable',
      'Risk-benefit ratio dynamically changes'
    ]
  },

  // International guidelines and policies
  guidelines: {
    china: {
      status: 'National Health Commission "Tumor Fertility Preservation Technology Management Standards (2024 Draft)" first includes OTC',
      sscStatus: 'Still classified as "clinical research"',
      year: 2024
    },
    usa: {
      fdaStatus: 'SSC transplantation not yet approved; OTC is practice-ready',
      year: 2024
    },
    europe: {
      eshre2023: 'Minimum follicle density standard (≥5 follicles/mm²)',
      organization: 'ESHRE Task Force',
      year: 2023
    }
  },

  // Key references for citations
  keyReferences: [
    {
      title: 'Fertility preservation in pediatric and adolescent cancer patients',
      authors: ['Anderson RA', 'Mitchell RT', 'Kelsey TW'],
      journal: 'Nature Reviews Endocrinology',
      year: 2021,
      doi: '10.1038/s41574-021-00539-w',
      pmid: '34417598'
    },
    {
      title: 'Ovarian tissue cryopreservation and transplantation: a systematic review',
      authors: ['Dolmans MM', 'Donnez J'],
      journal: 'Human Reproduction Update',
      year: 2023,
      doi: '10.1093/humupd/dmac048',
      pmid: '36708208'
    },
    {
      title: 'Testicular tissue cryopreservation and spermatogonial stem cell biology',
      authors: ['Valli-Pulaski H', 'Peters KA', 'Gassei K'],
      journal: 'Nature Reviews Urology',
      year: 2022,
      doi: '10.1038/s41585-022-00590-w',
      pmid: '35449249'
    },
    {
      title: 'Ethical considerations in fertility preservation for pediatric patients',
      authors: ['Quinn GP', 'Block RG', 'Clayman ML'],
      journal: 'Journal of Clinical Oncology',
      year: 2020,
      doi: '10.1200/JCO.19.02654',
      pmid: '32167829'
    }
  ]
}

// Helper function to get relevant knowledge for specific topics
export function getKnowledgeForTopic(topic: string) {
  const topicLower = topic.toLowerCase()
  
  if (topicLower.includes('伦理') || topicLower.includes('ethics')) {
    return {
      ethics: fertilityPreservationKnowledge.ethics,
      guidelines: fertilityPreservationKnowledge.guidelines,
      references: fertilityPreservationKnowledge.keyReferences.filter(ref => 
        ref.title.toLowerCase().includes('ethical')
      )
    }
  }
  
  if (topicLower.includes('技术') || topicLower.includes('technical')) {
    return {
      techniques: fertilityPreservationKnowledge.techniques,
      advances: fertilityPreservationKnowledge.recentAdvances,
      references: fertilityPreservationKnowledge.keyReferences.filter(ref => 
        ref.title.toLowerCase().includes('cryopreservation') || 
        ref.title.toLowerCase().includes('testicular') ||
        ref.title.toLowerCase().includes('ovarian')
      )
    }
  }
  
  // Default: return all knowledge
  return fertilityPreservationKnowledge
}