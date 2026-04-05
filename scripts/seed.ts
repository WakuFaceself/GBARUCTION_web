type SeedBlock = {
  id: string;
  type: "hero" | "richText" | "cta" | "eventMeta";
  data: Record<string, string>;
};

type SeedRecord = {
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  bodyLanguage: "zh" | "en";
  bodyBlocks: SeedBlock[];
};

const body = (id: string, content: string): SeedBlock => ({
  id,
  type: "richText",
  data: { content },
});

const homepage = {
  slug: "home",
  titleZh: "首页",
  titleEn: "Home",
  summaryZh: "推荐优先的首页策展页面。",
  summaryEn: "Recommendation-first homepage curation.",
  bodyLanguage: "zh" as const,
  bodyBlocks: [
    {
      id: "home-hero",
      type: "hero" as const,
      data: {
        eyebrow: "GBARUCTION",
        title: "推荐先于噪声，现场跟在后面。",
        description: "把推荐、演出、采访和海报实验室放在同一张策展封面里。",
      },
    },
    {
      id: "home-cta",
      type: "cta" as const,
      data: {
        title: "Poster Lab",
        description: "Coming soon",
        primaryLabel: "进入概念页",
        primaryHref: "/zh/poster-lab",
      },
    },
  ],
};

const recommendations: SeedRecord[] = [
  {
    slug: "neon-drift",
    titleZh: "霓虹漂移",
    titleEn: "Neon Drift",
    summaryZh: "一张把灰尘、鼓机和夜航声线揉在一起的潮湿合辑。",
    summaryEn: "A humid blend of dust, drum machines, and late-night vocal lines.",
    bodyLanguage: "en",
    bodyBlocks: [body("rec-1", "This is a single-language body example for the first recommendation.")],
  },
  {
    slug: "terminal-bloom",
    titleZh: "终端花开",
    titleEn: "Terminal Bloom",
    summaryZh: "更偏向噪音边缘与断裂旋律的二次推荐。",
    summaryEn: "A second pick leaning into noise edges and fractured melody.",
    bodyLanguage: "zh",
    bodyBlocks: [body("rec-2", "这篇保留中文正文，用于英文页提示条和单语正文演示。")],
  },
];

const shows: SeedRecord[] = [
  {
    slug: "basement-signal",
    titleZh: "地下信号",
    titleEn: "Basement Signal",
    summaryZh: "一场低照度、近距离、偏仓库气味的现场夜晚。",
    summaryEn: "A low-light, close-range live night with warehouse grit.",
    bodyLanguage: "zh",
    bodyBlocks: [
      {
        id: "show-meta",
        type: "eventMeta",
        data: {
          date: "2026-04-19",
          time: "20:00",
          venue: "No. 6 Warehouse",
          location: "Shanghai",
        },
      },
      body("show-body", "演出详情页展示时间、地点、票务和阵容的入口。"),
    ],
  },
];

const interviews: SeedRecord[] = [
  {
    slug: "dust-operator",
    titleZh: "与 Dust Operator 对话",
    titleEn: "Talking with Dust Operator",
    summaryZh: "关于巡演、拼贴感和如何让人群在黑暗里保持移动。",
    summaryEn: "On touring, collage instinct, and keeping a crowd moving in the dark.",
    bodyLanguage: "zh",
    bodyBlocks: [body("interview-1", "采访页维持更稳的阅读节奏，但仍保留粗粝感。")],
  },
];

const posterLab = {
  slug: "poster-lab",
  titleZh: "海报实验室",
  titleEn: "Poster Lab",
  summaryZh: "首版先作为概念页存在，后续接入可编辑海报工具。",
  summaryEn: "A concept page for the future editable poster tool.",
  bodyLanguage: "zh" as const,
  bodyBlocks: [body("poster-lab-body", "尚未开放的工具入口，但信息架构和视觉入口已经预埋。")],
};

const seedPayload = {
  homepage,
  recommendations,
  shows,
  interviews,
  posterLab,
};

console.log(JSON.stringify(seedPayload, null, 2));
