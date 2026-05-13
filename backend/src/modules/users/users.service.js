import { prisma } from '../../lib/prisma.js';

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      profile: {
        select: {
          phone: true,
          location: true,
          linkedinUrl: true,
          avatarUrl: true,
          careerStage: true,
          targetRole: true,
          targetIndustry: true,
          preferences: true,
        },
      },
    },
  });

  return user;
}
