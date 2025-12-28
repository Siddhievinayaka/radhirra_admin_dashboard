-- WhatsApp/Email Checkout System Database Migration
-- Execute these commands in your PostgreSQL database

-- 1. Add new columns to Radhirra_order table
ALTER TABLE "Radhirra_order" ADD COLUMN "order_type" VARCHAR(10) DEFAULT 'whatsapp';
ALTER TABLE "Radhirra_order" ADD COLUMN "order_status" VARCHAR(10) DEFAULT 'pending';
ALTER TABLE "Radhirra_order" ADD COLUMN "total_amount" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "Radhirra_order" ADD COLUMN "contact_value" VARCHAR(255);
ALTER TABLE "Radhirra_order" ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add constraints for data integrity
ALTER TABLE "Radhirra_order" ADD CONSTRAINT "chk_order_type" CHECK ("order_type" IN ('whatsapp', 'email'));
ALTER TABLE "Radhirra_order" ADD CONSTRAINT "chk_order_status" CHECK ("order_status" IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- 2. Add new columns to Radhirra_orderitem table
ALTER TABLE "Radhirra_orderitem" ADD COLUMN "price_at_order" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "Radhirra_orderitem" ADD COLUMN "variant_info" VARCHAR(255);

-- 3. Modify Radhirra_shippingaddress table
-- Make address fields optional
ALTER TABLE "Radhirra_shippingaddress" ALTER COLUMN "address" DROP NOT NULL;
ALTER TABLE "Radhirra_shippingaddress" ALTER COLUMN "city" DROP NOT NULL;
ALTER TABLE "Radhirra_shippingaddress" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "Radhirra_shippingaddress" ALTER COLUMN "zipcode" DROP NOT NULL;

-- Add phone number field
ALTER TABLE "Radhirra_shippingaddress" ADD COLUMN "phone_number" VARCHAR(20);

-- 4. Create indexes for better performance
CREATE INDEX "idx_order_status" ON "Radhirra_order"("order_status");
CREATE INDEX "idx_order_type" ON "Radhirra_order"("order_type");
CREATE INDEX "idx_order_date" ON "Radhirra_order"("date_ordered");

-- 5. Update existing orders with default values
UPDATE "Radhirra_order" SET "updated_at" = "date_ordered" WHERE "updated_at" IS NULL;

-- Verification queries
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'Radhirra_order' 
ORDER BY ordinal_position;