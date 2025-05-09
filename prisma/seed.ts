import { PrismaClient, TaskStatus } from '@prisma/client';
import { seedCureAccelerationAct } from './seeders/globalSolutions/cure-acceleration-act';

const prisma = new PrismaClient();

async function main() {
  await seedCureAccelerationAct()
  // 1. Create a System User
  // This user will be the creator of the initial problems, solutions, and tasks.
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@wishonia.com' },
    update: {},
    create: {
      name: 'Wishonia System',
      email: 'system@wishonia.com',
      // username will default to a UUID as per your schema
      // Set other required fields or let them take default values
    },
  });
  console.log(`Created/found system user: ${systemUser.name} (ID: ${systemUser.id})`);

  // 2. Create the "Build Wishonia Platform" GlobalProblem
  const buildWishoniaProblem = await prisma.globalProblem.upsert({
    where: { name: 'Build the Wishonia Platform' },
    update: {},
    create: {
      name: 'Build the Wishonia Platform',
      description: 'The comprehensive effort to design, develop, and deploy the Wishonia platform as outlined in its vision and roadmap. This involves creating all core modules, features, and achieving the stated goals of universal wish fulfillment through a utilitarian Paretopia.',
      userId: systemUser.id,
    },
  });
  console.log(`Created/found global problem: ${buildWishoniaProblem.name}`);

  // 3. Create "Phase 1: Foundational Platform & Gift Economy MVP" GlobalSolution
  const phase1Solution = await prisma.globalSolution.upsert({
    where: { name: 'Phase 1: Foundational Platform & Gift Economy MVP' },
    update: {},
    create: {
      name: 'Phase 1: Foundational Platform & Gift Economy MVP',
      description: 'Establish the core platform infrastructure, initial data models, and the first versions of the Marketplace and Recruitment modules with a gift economy focus, as per the roadmap. This phase lays the groundwork for future economic models and advanced AI integration.',
      userId: systemUser.id,
    },
  });
  console.log(`Created/found global solution: ${phase1Solution.name}`);

  // 4. Link Phase 1 Solution to Build Wishonia Problem
  await prisma.globalProblemSolution.upsert({
    where: {
      globalProblemId_globalSolutionId: {
        globalProblemId: buildWishoniaProblem.id,
        globalSolutionId: phase1Solution.id,
      },
    },
    update: {},
    create: {
      globalProblemId: buildWishoniaProblem.id,
      globalSolutionId: phase1Solution.id,
      name: `MVP Deployment for Building Wishonia`,
      description: `Implementing the Phase 1 MVP (Foundational Platform & Gift Economy) as a primary step towards the broader goal of building the complete Wishonia platform.`,
    }
  });
  console.log(`Linked ${phase1Solution.name} to ${buildWishoniaProblem.name}`);

  // 5. Create GlobalTasks for Phase 1 Roadmap Items
  const phase1TasksData = [
    {
      name: '[P1 Task] Develop Self-Improving GitHub Repository Agent',
      description: 'Create AI agents for project management, code generation, and codebase improvement to accelerate platform development. This corresponds to roadmap item #3 in Phase 1.',
      // Optional fields like complexity, estimatedHours can be added later
    },
    {
      name: '[P1 Task] Design and Implement Core Platform & Data Modeling',
      description: 'Establish the core database schema (Prisma) and data models for all key entities (User, Person, Organization, GlobalTask, WishingWell, etc.), ensuring support for initial gift-economy interactions and future economic features. This corresponds to roadmap item #4 in Phase 1.',
    },
    {
      name: '[P1 Task] Develop Wishonia Marketplace Module MVP (Gift Economy Focus)',
      description: 'Launch the marketplace for posting needs (WishingWell) and allowing providers (GenieDAO, User) to offer solutions/help (WishFulfillmentProposal) based on non-monetary exchange. Must include a robust reputation system (FulfillmentReview, GenieDAOFeedback) and task breakdown capabilities (GlobalTask). This corresponds to roadmap item #5 in Phase 1.',
    },
    {
      name: '[P1 Task] Develop Wishonia Recruitment Module MVP',
      description: 'Enable organizations to post opportunities (WishingWell adapted for jobs) and candidates (Person) to showcase skills and apply (JobApplication), initially focusing on connecting talent with needs. This corresponds to roadmap item #6 in Phase 1.',
    },
  ];

  for (const taskData of phase1TasksData) {
    const task = await prisma.globalTask.upsert({
      where: { name: taskData.name }, // Task names must be unique
      update: {
        description: taskData.description, // Ensure description is also updated if name matches
        status: TaskStatus.NOT_STARTED,
        userId: systemUser.id,
      },
      create: {
        ...taskData,
        userId: systemUser.id,
        status: TaskStatus.NOT_STARTED,
        // Add default values for other required fields if not in taskData
        // e.g., content: '', featuredImage: '', priority: 'MEDIUM',
      },
    });
    console.log(`Created/updated global task: ${task.name}`);

    // Link task to Phase 1 Solution
    await prisma.globalSolutionTask.upsert({
      where: {
        globalTaskId_globalSolutionId: {
          globalTaskId: task.id,
          globalSolutionId: phase1Solution.id,
        },
      },
      update: {},
      create: {
        globalTaskId: task.id,
        globalSolutionId: phase1Solution.id,
      },
    });
    console.log(`Linked task '${task.name}' to solution '${phase1Solution.name}'`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
