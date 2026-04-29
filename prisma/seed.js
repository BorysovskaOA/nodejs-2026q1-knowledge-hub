import { PrismaClient, UserRole, ArticleStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { login: 'admin_user' },
    update: {},
    create: {
      login: 'admin_user',
      passwordHash: 'hashed_password_123',
      role: UserRole.admin,
    },
  });

  const editor = await prisma.user.upsert({
    where: { login: 'editor_user' },
    update: {},
    create: {
      login: 'editor_user',
      passwordHash: 'hashed_password_456',
      role: UserRole.editor,
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Tech', description: 'Technology news' },
    }),
    prisma.category.create({
      data: { name: 'Lifestyle', description: 'Daily life tips' },
    }),
    prisma.category.create({
      data: { name: 'Education', description: 'Learning materials' },
    }),
  ]);

  const articlesData = [
    {
      title: 'How to slim Docker images',
      content: 'Long content about multi-stage builds...',
      status: ArticleStatus.published,
      authorId: admin.id,
      categoryId: categories[0].id,
      tags: ['Docker', 'Prisma'],
    },
    {
      title: 'Prisma Many-to-Many Guide',
      content: 'Implicit vs Explicit relations...',
      status: ArticleStatus.published,
      authorId: editor.id,
      categoryId: categories[0].id,
      tags: ['Prisma', 'NodeJS'],
    },
    {
      title: 'Morning Routine for Devs',
      content: 'Coffee and code...',
      status: ArticleStatus.draft,
      authorId: editor.id,
      categoryId: categories[1].id,
      tags: ['Tutorial'],
    },
    {
      title: 'Legacy SQL Database',
      content: 'Old school migrations...',
      status: ArticleStatus.archived,
      authorId: admin.id,
      categoryId: categories[2].id,
      tags: ['Database'],
    },
    {
      title: 'Learning Alpine Linux',
      content: 'Smallest distro ever...',
      status: ArticleStatus.published,
      authorId: editor.id,
      categoryId: categories[0].id,
      tags: ['Docker', 'Tutorial'],
    },
  ];

  const articles = [];

  for (const item of articlesData) {
    const article = await prisma.article.create({
      data: {
        title: item.title,
        content: item.content,
        status: item.status,
        authorId: item.authorId,
        categoryId: item.categoryId,
        tags: {
          connectOrCreate: item.tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
    });
    articles.push(article);
  }

  await prisma.comment.createMany({
    data: [
      {
        content: 'Great article, thanks!',
        articleId: articles[0].id,
        authorId: editor.id,
      },
      {
        content: 'Very helpful for my project.',
        articleId: articles[0].id,
        authorId: admin.id,
      },
      {
        content: 'I prefer explicit relations.',
        articleId: articles[1].id,
        authorId: admin.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
