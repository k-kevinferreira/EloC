CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- PRODUCT IMAGES
-- Estrutura relacional inicial para evolucao
-- de Product.image_url para multiplas imagens
-- =========================================
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" VARCHAR(255),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");
CREATE INDEX "product_images_display_order_idx" ON "product_images"("display_order");
CREATE INDEX "product_images_is_primary_idx" ON "product_images"("is_primary");

ALTER TABLE "product_images"
ADD CONSTRAINT "product_images_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

INSERT INTO "product_images" (
    "id",
    "product_id",
    "url",
    "alt_text",
    "display_order",
    "is_primary",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid(),
    "id",
    "image_url",
    NULL,
    0,
    true,
    "created_at",
    "updated_at"
FROM "products"
WHERE "image_url" IS NOT NULL
  AND LENGTH(TRIM("image_url")) > 0;
