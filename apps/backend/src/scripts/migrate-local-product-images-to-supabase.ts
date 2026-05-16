import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

type MigrationCandidate = {
  id: string;
  productId: string;
  currentUrl: string;
  localPath: string;
  storagePath: string;
  supabaseUrl: string;
};

const dryRun = !process.argv.includes('--execute');
const uploadsRoot = resolve(process.cwd(), process.env.UPLOADS_LOCAL_ROOT ?? 'uploads');
const localPublicBaseUrl = process.env.UPLOADS_PUBLIC_BASE_URL?.replace(/\/$/, '');
const supabaseUrl = getRequiredEnv('SUPABASE_URL');
const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images';
const supabasePublicBaseUrl = getRequiredEnv(
  'SUPABASE_STORAGE_PUBLIC_BASE_URL',
).replace(/\/$/, '');
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  const candidates = await resolveMigrationCandidates();
  const missingFiles: MigrationCandidate[] = [];
  const migrated: MigrationCandidate[] = [];
  const skipped: MigrationCandidate[] = [];

  console.log(
    `${dryRun ? 'Dry run' : 'Execute'}: found ${candidates.length} local product image URL(s).`,
  );

  for (const candidate of candidates) {
    if (!(await fileExists(candidate.localPath))) {
      missingFiles.push(candidate);
      console.warn(`Missing file: ${candidate.currentUrl} -> ${candidate.localPath}`);
      continue;
    }

    const fileStats = await stat(candidate.localPath);

    if (!fileStats.isFile()) {
      skipped.push(candidate);
      console.warn(`Not a file: ${candidate.currentUrl} -> ${candidate.localPath}`);
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${candidate.currentUrl} -> ${candidate.supabaseUrl}`);
      continue;
    }

    const { error } = await supabase.storage
      .from(supabaseBucket)
      .upload(candidate.storagePath, createReadStream(candidate.localPath), {
        contentType: resolveMimeType(candidate.localPath),
        upsert: false,
        duplex: 'half',
      });

    if (error && !isAlreadyExistsError(error.message)) {
      throw new Error(
        `Could not upload ${candidate.localPath} to Supabase: ${error.message}`,
      );
    }

    await prisma.$transaction([
      prisma.productImage.update({
        where: {
          id: candidate.id,
        },
        data: {
          url: candidate.supabaseUrl,
        },
      }),
      prisma.product.updateMany({
        where: {
          id: candidate.productId,
          imageUrl: candidate.currentUrl,
        },
        data: {
          imageUrl: candidate.supabaseUrl,
        },
      }),
    ]);

    migrated.push(candidate);
    console.log(`Migrated: ${candidate.currentUrl} -> ${candidate.supabaseUrl}`);
  }

  console.log(
    [
      `Total candidates: ${candidates.length}`,
      `Migrated: ${migrated.length}`,
      `Missing files: ${missingFiles.length}`,
      `Skipped: ${skipped.length}`,
      dryRun ? 'No database changes were made. Run with --execute to apply.' : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

async function resolveMigrationCandidates(): Promise<MigrationCandidate[]> {
  const images = await prisma.productImage.findMany({
    where: {
      url: {
        not: {
          startsWith: supabasePublicBaseUrl,
        },
      },
    },
    select: {
      id: true,
      productId: true,
      url: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return images.flatMap((image) => {
    const localPath = resolveLocalPath(image.url);

    if (!localPath) {
      return [];
    }

    const storagePath = buildSupabaseStoragePath(localPath);

    return {
      id: image.id,
      productId: image.productId,
      currentUrl: image.url,
      localPath,
      storagePath,
      supabaseUrl: `${supabasePublicBaseUrl}/${storagePath}`,
    };
  });
}

function resolveLocalPath(url: string) {
  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    return null;
  }

  if (localPublicBaseUrl && normalizedUrl.startsWith(`${localPublicBaseUrl}/`)) {
    const relativeUrlPath = normalizedUrl.slice(localPublicBaseUrl.length + 1);

    return resolve(uploadsRoot, decodeUrlPath(relativeUrlPath));
  }

  if (normalizedUrl.startsWith('/uploads/')) {
    return resolve(uploadsRoot, decodeUrlPath(normalizedUrl.slice('/uploads/'.length)));
  }

  if (normalizedUrl.startsWith('uploads/')) {
    return resolve(uploadsRoot, decodeUrlPath(normalizedUrl.slice('uploads/'.length)));
  }

  return null;
}

function buildSupabaseStoragePath(localPath: string) {
  const relativePath = relative(uploadsRoot, localPath).replace(/\\/g, '/');

  if (relativePath && !relativePath.startsWith('..')) {
    return `migrated/${relativePath}`;
  }

  return `migrated/product-images/${Date.now()}-${basename(localPath)}`;
}

function decodeUrlPath(path: string) {
  return path
    .split('/')
    .map((part) => decodeURIComponent(part))
    .join('/');
}

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function resolveMimeType(path: string) {
  const normalizedPath = path.toLowerCase();

  if (normalizedPath.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedPath.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function isAlreadyExistsError(message: string) {
  return message.toLowerCase().includes('already exists');
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

void main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error while migrating product images.';

    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
