import { hash } from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

type ParsedArgs = {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
};

const prisma = new PrismaClient();

function parseArgs(argv: string[]): ParsedArgs {
  return argv.reduce<ParsedArgs>((accumulator, currentArg) => {
    if (!currentArg.startsWith('--')) {
      return accumulator;
    }

    const [rawKey, ...valueParts] = currentArg.slice(2).split('=');
    const value = valueParts.join('=');

    if (!value) {
      return accumulator;
    }

    if (rawKey === 'email') {
      accumulator.email = value.trim().toLowerCase();
    }

    if (rawKey === 'name') {
      accumulator.name = value.trim();
    }

    if (rawKey === 'password') {
      accumulator.password = value;
    }

    if (rawKey === 'role') {
      accumulator.role = value.trim();
    }

    return accumulator;
  }, {});
}

function assertRequiredArgs(args: ParsedArgs) {
  if (!args.name) {
    throw new Error('Missing required argument: --name=<admin name>');
  }

  if (!args.email) {
    throw new Error('Missing required argument: --email=<admin email>');
  }

  if (!args.password) {
    throw new Error('Missing required argument: --password=<admin password>');
  }

  if (args.password.length < 8) {
    throw new Error('Admin password must have at least 8 characters.');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  assertRequiredArgs(args);

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: args.email,
    },
  });

  if (existingAdmin) {
    throw new Error(`An admin with email "${args.email}" already exists.`);
  }

  const passwordHash = await hash(args.password!, 12);

  const admin = await prisma.admin.create({
    data: {
      name: args.name!,
      email: args.email!,
      passwordHash,
      role: args.role ?? 'super_admin',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  console.log('Admin created successfully.');
  console.log(JSON.stringify(admin, null, 2));
}

void main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown error while creating admin.';

    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
