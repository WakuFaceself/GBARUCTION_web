import { and, eq } from "drizzle-orm";

import { createDb } from "@/lib/db/client";
import {
  contentTagLinks,
  interviews as interviewTable,
  pages as pageTable,
  recommendations as recommendationTable,
  shows as showTable,
  siteSettings,
  tags,
} from "@/lib/db/schema/content";
import { hasDatabaseUrl } from "@/lib/env";

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
  tags?: string[];
};

const body = (id: string, content: string): SeedBlock => ({
  id,
  type: "richText",
  data: { content },
});

const homepage: SeedRecord = {
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
  tags: ["home", "curation"],
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
    tags: ["synth", "post-punk", "midnight"],
  },
  {
    slug: "terminal-bloom",
    titleZh: "终端花开",
    titleEn: "Terminal Bloom",
    summaryZh: "更偏向噪音边缘与断裂旋律的二次推荐。",
    summaryEn: "A second pick leaning into noise edges and fractured melody.",
    bodyLanguage: "zh",
    bodyBlocks: [body("rec-2", "这篇保留中文正文，用于英文页提示条和单语正文演示。")],
    tags: ["noise", "kraut", "late set"],
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
    tags: ["live", "warehouse", "ticketed"],
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
    tags: ["conversation", "collage", "tour"],
  },
];

const posterLab: SeedRecord = {
  slug: "poster-lab",
  titleZh: "海报实验室",
  titleEn: "Poster Lab",
  summaryZh: "首版先作为概念页存在，后续接入可编辑海报工具。",
  summaryEn: "A concept page for the future editable poster tool.",
  bodyLanguage: "zh" as const,
  bodyBlocks: [body("poster-lab-body", "尚未开放的工具入口，但信息架构和视觉入口已经预埋。")],
  tags: ["poster", "concept"],
};

const seedPayload = {
  homepage,
  recommendations,
  shows,
  interviews,
  posterLab,
};

function slugifyTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function syncTags(contentType: "recommendations" | "shows" | "interviews" | "pages", contentId: string, tagValues: string[]) {
  const db = createDb();

  await db
    .delete(contentTagLinks)
    .where(and(eq(contentTagLinks.contentType, contentType), eq(contentTagLinks.contentId, contentId)));

  for (const value of tagValues) {
    const slug = slugifyTag(value);
    if (!slug) {
      continue;
    }

    const [tagRecord] = await db
      .insert(tags)
      .values({
        slug,
        labelZh: value,
        labelEn: value,
      })
      .onConflictDoUpdate({
        target: tags.slug,
        set: {
          labelZh: value,
          labelEn: value,
          updatedAt: new Date(),
        },
      })
      .returning({ id: tags.id });

    await db.insert(contentTagLinks).values({
      contentType,
      contentId,
      tagId: tagRecord.id,
    });
  }
}

async function seedRecommendations() {
  const db = createDb();

  for (const [index, record] of recommendations.entries()) {
    const [row] = await db
      .insert(recommendationTable)
      .values({
        slug: record.slug,
        status: "published",
        titleZh: record.titleZh,
        titleEn: record.titleEn,
        summaryZh: record.summaryZh,
        summaryEn: record.summaryEn,
        bodyLanguage: record.bodyLanguage,
        bodyBlocks: record.bodyBlocks,
        subjectName: index === 0 ? "午夜合成器项目" : "终端现场剪影",
        embedProvider: index === 0 ? "spotify" : "youtube",
        embedUrl: index === 0 ? "https://open.spotify.com" : "https://youtube.com",
        externalLinks:
          index === 0
            ? [
                { label: "Spotify", href: "https://open.spotify.com" },
                { label: "Bandcamp", href: "https://bandcamp.com" },
              ]
            : [{ label: "YouTube", href: "https://youtube.com" }],
        publishedAt: new Date(`2026-04-0${5 - index}T08:00:00.000Z`),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: recommendationTable.slug,
        set: {
          status: "published",
          titleZh: record.titleZh,
          titleEn: record.titleEn,
          summaryZh: record.summaryZh,
          summaryEn: record.summaryEn,
          bodyLanguage: record.bodyLanguage,
          bodyBlocks: record.bodyBlocks,
          subjectName: index === 0 ? "午夜合成器项目" : "终端现场剪影",
          embedProvider: index === 0 ? "spotify" : "youtube",
          embedUrl: index === 0 ? "https://open.spotify.com" : "https://youtube.com",
          externalLinks:
            index === 0
              ? [
                  { label: "Spotify", href: "https://open.spotify.com" },
                  { label: "Bandcamp", href: "https://bandcamp.com" },
                ]
              : [{ label: "YouTube", href: "https://youtube.com" }],
          publishedAt: new Date(`2026-04-0${5 - index}T08:00:00.000Z`),
          updatedAt: new Date(),
        },
      })
      .returning({ id: recommendationTable.id });

    await syncTags("recommendations", row.id, record.tags ?? []);
  }
}

async function seedShows() {
  const db = createDb();

  for (const record of shows) {
    const [row] = await db
      .insert(showTable)
      .values({
        slug: record.slug,
        status: "published",
        titleZh: record.titleZh,
        titleEn: record.titleEn,
        summaryZh: record.summaryZh,
        summaryEn: record.summaryEn,
        bodyLanguage: record.bodyLanguage,
        bodyBlocks: record.bodyBlocks,
        startsAt: new Date("2026-04-19T12:00:00.000Z"),
        venue: "No. 6 Warehouse",
        city: "Shanghai",
        ticketUrl: "https://example.com/tickets",
        lineupTextZh: "三组乐队连演，带来从极简噪音到舞池断层的切换。",
        lineupTextEn: "Three acts moving from minimal noise into dancefloor fracture.",
        publishedAt: new Date("2026-04-04T12:00:00.000Z"),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: showTable.slug,
        set: {
          status: "published",
          titleZh: record.titleZh,
          titleEn: record.titleEn,
          summaryZh: record.summaryZh,
          summaryEn: record.summaryEn,
          bodyLanguage: record.bodyLanguage,
          bodyBlocks: record.bodyBlocks,
          startsAt: new Date("2026-04-19T12:00:00.000Z"),
          venue: "No. 6 Warehouse",
          city: "Shanghai",
          ticketUrl: "https://example.com/tickets",
          lineupTextZh: "三组乐队连演，带来从极简噪音到舞池断层的切换。",
          lineupTextEn: "Three acts moving from minimal noise into dancefloor fracture.",
          publishedAt: new Date("2026-04-04T12:00:00.000Z"),
          updatedAt: new Date(),
        },
      })
      .returning({ id: showTable.id });

    await syncTags("shows", row.id, record.tags ?? []);
  }
}

async function seedInterviews() {
  const db = createDb();

  for (const record of interviews) {
    const [row] = await db
      .insert(interviewTable)
      .values({
        slug: record.slug,
        status: "published",
        titleZh: record.titleZh,
        titleEn: record.titleEn,
        summaryZh: record.summaryZh,
        summaryEn: record.summaryEn,
        bodyLanguage: record.bodyLanguage,
        bodyBlocks: record.bodyBlocks,
        relatedEntityTextZh: "关联对象：Dust Operator 主脑",
        relatedEntityTextEn: "Related entity: Dust Operator",
        publishedAt: new Date("2026-04-04T16:00:00.000Z"),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: interviewTable.slug,
        set: {
          status: "published",
          titleZh: record.titleZh,
          titleEn: record.titleEn,
          summaryZh: record.summaryZh,
          summaryEn: record.summaryEn,
          bodyLanguage: record.bodyLanguage,
          bodyBlocks: record.bodyBlocks,
          relatedEntityTextZh: "关联对象：Dust Operator 主脑",
          relatedEntityTextEn: "Related entity: Dust Operator",
          publishedAt: new Date("2026-04-04T16:00:00.000Z"),
          updatedAt: new Date(),
        },
      })
      .returning({ id: interviewTable.id });

    await syncTags("interviews", row.id, record.tags ?? []);
  }
}

async function seedPages() {
  const db = createDb();
  const managedPages = [homepage, posterLab];

  for (const page of managedPages) {
    const [row] = await db
      .insert(pageTable)
      .values({
        slug: page.slug,
        status: "published",
        titleZh: page.titleZh,
        titleEn: page.titleEn,
        summaryZh: page.summaryZh,
        summaryEn: page.summaryEn,
        bodyLanguage: page.bodyLanguage,
        bodyBlocks: page.bodyBlocks,
        publishedAt: new Date("2026-04-05T08:00:00.000Z"),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pageTable.slug,
        set: {
          status: "published",
          titleZh: page.titleZh,
          titleEn: page.titleEn,
          summaryZh: page.summaryZh,
          summaryEn: page.summaryEn,
          bodyLanguage: page.bodyLanguage,
          bodyBlocks: page.bodyBlocks,
          publishedAt: new Date("2026-04-05T08:00:00.000Z"),
          updatedAt: new Date(),
        },
      })
      .returning({ id: pageTable.id });

    await syncTags("pages", row.id, page.tags ?? []);
  }

  await db
    .insert(siteSettings)
    .values({
      key: "home",
      value: {
        heroSlug: homepage.slug,
        recommendations: recommendations.map((item) => item.slug),
        shows: shows.map((item) => item.slug),
        interviews: interviews.map((item) => item.slug),
        posterLabSlug: posterLab.slug,
      },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: {
          heroSlug: homepage.slug,
          recommendations: recommendations.map((item) => item.slug),
          shows: shows.map((item) => item.slug),
          interviews: interviews.map((item) => item.slug),
          posterLabSlug: posterLab.slug,
        },
        updatedAt: new Date(),
      },
    });
}

async function main() {
  if (!hasDatabaseUrl()) {
    console.log(JSON.stringify(seedPayload, null, 2));
    console.log("\nNo DATABASE_URL detected, so the seed script only printed the preview payload.");
    return;
  }

  await seedRecommendations();
  await seedShows();
  await seedInterviews();
  await seedPages();

  console.log("Seeded GBARUCTION content into the configured database.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
