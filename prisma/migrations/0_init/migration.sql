-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('MPESA', 'STRIPE');

-- CreateEnum
CREATE TYPE "public"."OrgStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."ApiKeyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."DataSourceType" AS ENUM ('POS_SYSTEM', 'ERP', 'DATABASE', 'API', 'FILE_IMPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."DataSourceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'SYNCING');

-- CreateEnum
CREATE TYPE "public"."StreamStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."SubStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaPendingSecret" TEXT,
    "mfaBackupCodes" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "refreshTokenHash" TEXT,
    "resetTokenHash" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "featureFlags" JSONB,
    "lastLoginAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dashboard_layout" JSONB,
    "layout_mode" TEXT DEFAULT 'beginner',
    "is_technical" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "settings" JSONB,
    "status" "public"."OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "planId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "provider" "public"."PaymentProvider" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "checkoutRequestId" TEXT,
    "merchantRequestId" TEXT,
    "mpesaReceiptNumber" TEXT,
    "phoneNumber" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MpesaCallback" (
    "id" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "resultCode" TEXT NOT NULL,
    "resultDesc" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "mpesaReceiptNumber" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MpesaCallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentReconciliation" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "successfulTransactions" INTEGER NOT NULL,
    "failedTransactions" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "PaymentReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" JSONB NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" "public"."SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "billingInfo" JSONB,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "scopes" TEXT[],
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiUsage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT,
    "orgId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportTicket" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "orgId" TEXT,
    "status" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DataSourceType" NOT NULL,
    "orgId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."DataSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataStream" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "transformations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."StreamStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "DataStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "data" JSONB[],

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analysis" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "parameters" JSONB,
    "results" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "error" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndustrySchema" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustrySchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastRun" TIMESTAMP(3),
    "results" JSONB,

    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsSchedule" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT DEFAULT 'INFO',
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "isOrgWide" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_subdomain_key" ON "public"."Organization"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutRequestId_key" ON "public"."Payment"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "Payment_userProfileId_idx" ON "public"."Payment"("userProfileId");

-- CreateIndex
CREATE INDEX "Payment_orgId_idx" ON "public"."Payment"("orgId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "MpesaCallback_checkoutRequestId_idx" ON "public"."MpesaCallback"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "MpesaCallback_transactionDate_idx" ON "public"."MpesaCallback"("transactionDate");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReconciliation_date_key" ON "public"."PaymentReconciliation"("date");

-- CreateIndex
CREATE INDEX "PaymentReconciliation_date_idx" ON "public"."PaymentReconciliation"("date");

-- CreateIndex
CREATE INDEX "PaymentReconciliation_orgId_idx" ON "public"."PaymentReconciliation"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "public"."Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_orgId_key" ON "public"."Subscription"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "public"."ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiUsage_userId_orgId_idx" ON "public"."ApiUsage"("userId", "orgId");

-- CreateIndex
CREATE INDEX "ApiUsage_createdAt_idx" ON "public"."ApiUsage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IndustrySchema_type_key" ON "public"."IndustrySchema"("type");

-- CreateIndex
CREATE INDEX "Notification_orgId_idx" ON "public"."Notification"("orgId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_idx" ON "public"."RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_action_idx" ON "public"."RateLimit"("action");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Organization" ADD CONSTRAINT "Organization_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MpesaCallback" ADD CONSTRAINT "MpesaCallback_checkoutRequestId_fkey" FOREIGN KEY ("checkoutRequestId") REFERENCES "public"."Payment"("checkoutRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentReconciliation" ADD CONSTRAINT "PaymentReconciliation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiUsage" ADD CONSTRAINT "ApiUsage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiUsage" ADD CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataSource" ADD CONSTRAINT "DataSource_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataStream" ADD CONSTRAINT "DataStream_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "public"."DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dataset" ADD CONSTRAINT "Dataset_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "public"."DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dataset" ADD CONSTRAINT "Dataset_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analysis" ADD CONSTRAINT "Analysis_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "public"."Dataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsReport" ADD CONSTRAINT "AnalyticsReport_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsSchedule" ADD CONSTRAINT "AnalyticsSchedule_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

