-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ProductReview" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
