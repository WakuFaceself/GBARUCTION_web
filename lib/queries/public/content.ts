import type { ContentBlock } from "@/lib/blocks/schema";
import type { Locale } from "@/lib/i18n";

export type PublicKind = "recommendation" | "show" | "interview";

export type PublicContentLink = {
  label: string;
  href: string;
};

export type PublicContentItem = {
  kind: PublicKind;
  slug: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  tags: string[];
  bodyLanguage: Locale;
  bodyBlocks: ContentBlock[];
  publishedAt: string;
  featured?: boolean;
  recommendation?: {
    subjectName: Record<Locale, string>;
    externalLinks: PublicContentLink[];
  };
  show?: {
    startsAt: string;
    venue: string;
    city: string;
    ticketUrl?: string;
    lineup: Record<Locale, string>;
  };
  interview?: {
    relatedEntityText: Record<Locale, string>;
  };
};

function richTextBlock(id: string, content: string): ContentBlock {
  return {
    id,
    type: "richText",
    data: {
      content,
    },
  };
}

const publicContent: Record<PublicKind, PublicContentItem[]> = {
  recommendation: [
    {
      kind: "recommendation",
      slug: "neon-drift",
      title: {
        zh: "霓虹漂移",
        en: "Neon Drift",
      },
      summary: {
        zh: "一张把灰尘、鼓机和夜航声线揉在一起的潮湿合辑。",
        en: "A humid blend of dust, drum machines, and late-night vocal lines.",
      },
      tags: ["synth", "post-punk", "midnight"],
      bodyLanguage: "en",
      bodyBlocks: [
        richTextBlock(
          "neon-drift-body",
          "This is a single-language body example that keeps the article readable without assuming a bilingual draft.\n\nThe recommendation page still keeps the loud navigation and external links, but the body stays in one language only.",
        ),
      ],
      publishedAt: "2026-04-05T08:00:00.000Z",
      featured: true,
      recommendation: {
        subjectName: {
          zh: "午夜合成器项目",
          en: "Midnight synth project",
        },
        externalLinks: [
          { label: "Spotify", href: "https://open.spotify.com" },
          { label: "Bandcamp", href: "https://bandcamp.com" },
        ],
      },
    },
    {
      kind: "recommendation",
      slug: "terminal-bloom",
      title: {
        zh: "终端花开",
        en: "Terminal Bloom",
      },
      summary: {
        zh: "更偏向噪音边缘与断裂旋律的二次推荐。",
        en: "A second pick leaning into noise edges and fractured melody.",
      },
      tags: ["noise", "kraut", "late set"],
      bodyLanguage: "zh",
      bodyBlocks: [richTextBlock("terminal-bloom-body", "这篇保留较短正文，用于支撑浏览与搜索演示。")],
      publishedAt: "2026-04-03T08:00:00.000Z",
      recommendation: {
        subjectName: {
          zh: "终端现场剪影",
          en: "Terminal live sketch",
        },
        externalLinks: [{ label: "YouTube", href: "https://youtube.com" }],
      },
    },
    {
      kind: "recommendation",
      slug: "black-mirror-loop",
      title: {
        zh: "黑镜循环",
        en: "Black Mirror Loop",
      },
      summary: {
        zh: "一条偏冷的电子线路，适合深夜滚动阅读。",
        en: "A colder electronic line for late-night scrolling.",
      },
      tags: ["electronic", "loop", "slow burn"],
      bodyLanguage: "zh",
      bodyBlocks: [richTextBlock("black-mirror-loop-body", "第三条推荐用来让列表显得更像一个正在更新的策展页。")],
      publishedAt: "2026-04-01T08:00:00.000Z",
      recommendation: {
        subjectName: {
          zh: "黑镜循环",
          en: "Black Mirror Loop",
        },
        externalLinks: [{ label: "Apple Music", href: "https://music.apple.com" }],
      },
    },
  ],
  show: [
    {
      kind: "show",
      slug: "basement-signal",
      title: {
        zh: "地下信号",
        en: "Basement Signal",
      },
      summary: {
        zh: "一场低照度、近距离、偏仓库气味的现场夜晚。",
        en: "A low-light, close-range live night with warehouse grit.",
      },
      tags: ["live", "warehouse", "ticketed"],
      bodyLanguage: "zh",
      bodyBlocks: [richTextBlock("basement-signal-body", "演出详情页展示时间、场地与阵容信息，并给出清晰的行动入口。")],
      publishedAt: "2026-04-04T12:00:00.000Z",
      show: {
        startsAt: "2026-04-19T12:00:00.000Z",
        venue: "No. 6 Warehouse",
        city: "Shanghai",
        ticketUrl: "https://example.com/tickets",
        lineup: {
          zh: "三组乐队连演，带来从极简噪音到舞池断层的切换。",
          en: "Three acts moving from minimal noise into dancefloor fracture.",
        },
      },
    },
    {
      kind: "show",
      slug: "flicker-room",
      title: {
        zh: "闪烁房间",
        en: "Flicker Room",
      },
      summary: {
        zh: "一场更偏实验与即兴的近场表演。",
        en: "A more experimental and improvised close-room performance.",
      },
      tags: ["experimental", "improv", "all ages"],
      bodyLanguage: "zh",
      bodyBlocks: [richTextBlock("flicker-room-body", "这一场用于补充演出栏目里的第二层浏览。")],
      publishedAt: "2026-04-02T12:00:00.000Z",
      show: {
        startsAt: "2026-04-24T12:00:00.000Z",
        venue: "The Hidden Club",
        city: "Beijing",
        lineup: {
          zh: "即兴鼓组、合成器与视觉投影交错。",
          en: "Improvised drums, synths, and projected textures.",
        },
      },
    },
  ],
  interview: [
    {
      kind: "interview",
      slug: "dust-operator",
      title: {
        zh: "与 Dust Operator 对话",
        en: "Talking with Dust Operator",
      },
      summary: {
        zh: "关于巡演、拼贴感和如何让人群在黑暗里保持移动。",
        en: "On touring, collage instinct, and keeping a crowd moving in the dark.",
      },
      tags: ["conversation", "collage", "tour"],
      bodyLanguage: "zh",
      bodyBlocks: [richTextBlock("dust-operator-body", "采访页保留阅读重心，但同样维持厂牌的粗粝感和节奏。")],
      publishedAt: "2026-04-04T16:00:00.000Z",
      interview: {
        relatedEntityText: {
          zh: "关联对象：Dust Operator 主脑",
          en: "Related entity: Dust Operator",
        },
      },
    },
    {
      kind: "interview",
      slug: "midnight-crew",
      title: {
        zh: "夜航制作组访谈",
        en: "Midnight Crew Interview",
      },
      summary: {
        zh: "关于现场记录、印刷物和如何把一场表演变成一张海报。",
        en: "On live documentation, printed matter, and turning a show into a poster.",
      },
      tags: ["print", "poster", "field notes"],
      bodyLanguage: "zh",
      bodyBlocks: [richTextBlock("midnight-crew-body", "第二篇采访继续强调人物和内容深度。")],
      publishedAt: "2026-04-01T16:00:00.000Z",
      interview: {
        relatedEntityText: {
          zh: "关联对象：夜航制作组",
          en: "Related entity: Midnight Crew",
        },
      },
    },
  ],
};

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function getPublicCollection(kind: PublicKind, locale: Locale) {
  return publicContent[kind]
    .slice()
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .map((item) => ({
      ...item,
      displayTitle: item.title[locale],
      displaySummary: item.summary[locale],
      displayTags: item.tags,
      displayDate: formatDate(item.publishedAt, locale),
    }));
}

export function getPublicItem(kind: PublicKind, slug: string) {
  return publicContent[kind].find((item) => item.slug === slug) ?? null;
}

export function searchPublicContent(query: string, locale: Locale) {
  const needle = normalizeText(query);

  if (!needle) {
    return [];
  }

  return (["recommendation", "show", "interview"] as const)
    .flatMap((kind) =>
      getPublicCollection(kind, locale).filter((item) => {
        const searchable = [
          item.title.zh,
          item.title.en,
          item.summary.zh,
          item.summary.en,
          ...item.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(needle);
      }),
    )
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getBrowseHighlights(locale: Locale) {
  return {
    recommendations: getPublicCollection("recommendation", locale).slice(0, 3),
    shows: getPublicCollection("show", locale).slice(0, 2),
    interviews: getPublicCollection("interview", locale).slice(0, 2),
  };
}

export function formatPublicDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}
