import {
  prisma,
} from "../app/providers/prisma";

enum Role {
  Student = "student",
  Company = "company",
  AccountManager = "account-manager",
  PR = "pr",
  Admin = "admin",
}

async function runSeeders() {
  await Promise.allSettled(Object.values(Role).map((name) => prisma.role.create({
    data: {
      name,
    },
  })));
}

void runSeeders()
  .catch((e) => {
    console.error(`There was an error while seeding: ${ String(e) }`);
    process.exit(1);
  })
  .then(() => prisma.$disconnect())
  .finally(() => {
    console.log("Successfully seeded database. Closing connection.");
  });
