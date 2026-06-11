ALTER TABLE "telegram_product_drafts"
DROP CONSTRAINT IF EXISTS "telegram_product_drafts_status_check";

ALTER TABLE "telegram_product_drafts"
ADD CONSTRAINT "telegram_product_drafts_status_check"
CHECK (
    "status" IN (
        'WAITING_PRICE',
        'PROCESSING',
        'COMPLETED',
        'CANCELLED',
        'ERROR',
        'WAITING_NAME_EDIT',
        'WAITING_DESCRIPTION_EDIT'
    )
);
