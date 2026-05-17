-- DropForeignKey
ALTER TABLE "complaint_logs" DROP CONSTRAINT "logs_admin_fk";

-- DropForeignKey
ALTER TABLE "complaint_logs" DROP CONSTRAINT "logs_complaint_fk";

-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_user_fk";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_fk";

-- AlterTable
ALTER TABLE "complaints" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_logs" ADD CONSTRAINT "logs_complaint_fk" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_logs" ADD CONSTRAINT "logs_admin_fk" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
