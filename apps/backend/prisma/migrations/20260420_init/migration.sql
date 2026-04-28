-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- =========================================
-- ADMINS
-- =========================================
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");


-- =========================================
-- CATEGORIES
-- =========================================
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");
CREATE INDEX "categories_display_order_idx" ON "categories"("display_order");


-- =========================================
-- SUBCATEGORIES
-- =========================================
CREATE TABLE "subcategories" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "subcategories_category_id_idx" ON "subcategories"("category_id");
CREATE INDEX "subcategories_is_active_idx" ON "subcategories"("is_active");
CREATE INDEX "subcategories_display_order_idx" ON "subcategories"("display_order");
CREATE UNIQUE INDEX "subcategories_category_id_slug_key" ON "subcategories"("category_id", "slug");


-- =========================================
-- PRODUCTS
-- =========================================
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "subcategory_id" UUID,
    "code" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "image_url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_price_check" CHECK ("price" >= 0)
);

CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "products_subcategory_id_idx" ON "products"("subcategory_id");
CREATE INDEX "products_is_active_idx" ON "products"("is_active");
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");
CREATE INDEX "products_display_order_idx" ON "products"("display_order");


-- =========================================
-- SALES ENTRIES
-- Registro manual administrativo de vendas
-- Não representa checkout online
-- =========================================
CREATE TABLE "sales_entries" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'paid',
    "customer_name" VARCHAR(160),
    "notes" TEXT,
    "sold_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sales_entries_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "sales_entries_unit_price_check" CHECK ("unit_price" >= 0),
    CONSTRAINT "sales_entries_total_amount_check" CHECK ("total_amount" >= 0),
    CONSTRAINT "sales_entries_total_amount_matches_check" CHECK ("total_amount" = ("quantity" * "unit_price"))
);

CREATE INDEX "sales_entries_product_id_idx" ON "sales_entries"("product_id");
CREATE INDEX "sales_entries_sold_at_idx" ON "sales_entries"("sold_at");
CREATE INDEX "sales_entries_status_idx" ON "sales_entries"("status");
CREATE INDEX "sales_entries_payment_method_idx" ON "sales_entries"("payment_method");


-- =========================================
-- SHIPMENTS
-- Entrada de mercadoria / remessa
-- =========================================
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "supplier" VARCHAR(160) NOT NULL,
    "shipment_date" DATE NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shipments_total_cost_check" CHECK ("total_cost" >= 0)
);

CREATE UNIQUE INDEX "shipments_code_key" ON "shipments"("code");
CREATE INDEX "shipments_shipment_date_idx" ON "shipments"("shipment_date");


-- =========================================
-- SHIPMENT ITEMS
-- Itens de cada remessa
-- =========================================
CREATE TABLE "shipment_items" (
    "id" UUID NOT NULL,
    "shipment_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(12,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shipment_items_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "shipment_items_unit_cost_check" CHECK ("unit_cost" >= 0),
    CONSTRAINT "shipment_items_total_cost_check" CHECK ("total_cost" >= 0),
    CONSTRAINT "shipment_items_total_cost_matches_check" CHECK ("total_cost" = ("quantity" * "unit_cost"))
);

CREATE INDEX "shipment_items_shipment_id_idx" ON "shipment_items"("shipment_id");
CREATE INDEX "shipment_items_product_id_idx" ON "shipment_items"("product_id");


-- =========================================
-- EXPENSES
-- Despesas operacionais simples
-- Pode ou não estar vinculada a uma remessa
-- =========================================
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "shipment_id" UUID,
    "type" VARCHAR(60) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "expense_date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "expenses_amount_check" CHECK ("amount" >= 0)
);

CREATE INDEX "expenses_shipment_id_idx" ON "expenses"("shipment_id");
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");
CREATE INDEX "expenses_type_idx" ON "expenses"("type");


-- =========================================
-- FOREIGN KEYS
-- =========================================
ALTER TABLE "subcategories"
ADD CONSTRAINT "subcategories_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "categories"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "products"
ADD CONSTRAINT "products_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "categories"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "products"
ADD CONSTRAINT "products_subcategory_id_fkey"
FOREIGN KEY ("subcategory_id")
REFERENCES "subcategories"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "sales_entries"
ADD CONSTRAINT "sales_entries_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_shipment_id_fkey"
FOREIGN KEY ("shipment_id")
REFERENCES "shipments"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "shipment_items"
ADD CONSTRAINT "shipment_items_shipment_id_fkey"
FOREIGN KEY ("shipment_id")
REFERENCES "shipments"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "shipment_items"
ADD CONSTRAINT "shipment_items_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
