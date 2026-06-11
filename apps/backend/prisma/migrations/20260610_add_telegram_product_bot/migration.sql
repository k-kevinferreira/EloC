-- =========================================
-- TELEGRAM + AI PRODUCT METADATA
-- =========================================
ALTER TABLE "products"
ADD COLUMN "source" VARCHAR(50),
ADD COLUMN "ai_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "suggested_category" VARCHAR(120),
ADD COLUMN "ai_tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "products_source_idx" ON "products"("source");
CREATE INDEX "products_ai_generated_idx" ON "products"("ai_generated");

-- =========================================
-- REVIEW TAXONOMY
-- Internal inactive taxonomy used only for products
-- imported from Telegram before manual review.
-- =========================================
INSERT INTO "categories" (
    "id",
    "name",
    "slug",
    "is_active",
    "display_order",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid(),
    'Revisar',
    'revisar',
    false,
    9999,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "categories" WHERE "slug" = 'revisar'
);

INSERT INTO "subcategories" (
    "id",
    "category_id",
    "name",
    "slug",
    "is_active",
    "display_order",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid(),
    "categories"."id",
    'Revisar',
    'revisar',
    false,
    9999,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "categories"
WHERE "categories"."slug" = 'revisar'
  AND NOT EXISTS (
      SELECT 1
      FROM "subcategories"
      WHERE "subcategories"."category_id" = "categories"."id"
        AND "subcategories"."slug" = 'revisar'
  );

-- =========================================
-- TELEGRAM PRODUCT DRAFTS
-- =========================================
CREATE TABLE "telegram_product_drafts" (
    "id" UUID NOT NULL,
    "chat_id" VARCHAR(80) NOT NULL,
    "telegram_file_id" VARCHAR(255) NOT NULL,
    "caption" TEXT,
    "price" DECIMAL(10,2),
    "status" VARCHAR(30) NOT NULL DEFAULT 'WAITING_PRICE',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "product_id" UUID,

    CONSTRAINT "telegram_product_drafts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "telegram_product_drafts_price_check" CHECK ("price" IS NULL OR "price" > 0),
    CONSTRAINT "telegram_product_drafts_status_check" CHECK ("status" IN ('WAITING_PRICE', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'ERROR'))
);

CREATE INDEX "telegram_product_drafts_chat_status_created_idx"
ON "telegram_product_drafts"("chat_id", "status", "created_at");

CREATE INDEX "telegram_product_drafts_product_id_idx"
ON "telegram_product_drafts"("product_id");

ALTER TABLE "telegram_product_drafts"
ADD CONSTRAINT "telegram_product_drafts_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
