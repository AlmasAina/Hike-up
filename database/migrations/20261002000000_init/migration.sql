-- HIKE UP General Maintenance — initial schema
-- gen_random_uuid() is built into PostgreSQL 13+.

-- Human friendly quote reference numbers: HU-<year>-<6 digit sequence>
CREATE SEQUENCE IF NOT EXISTS quote_reference_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_quote_reference()
RETURNS varchar
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  RETURN 'HU-' || to_char(now() AT TIME ZONE 'Asia/Dubai', 'YYYY') || '-' ||
         lpad(nextval('quote_reference_seq')::text, 6, '0');
END;
$$;

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ServiceFeatureType" AS ENUM ('BENEFIT', 'COVERAGE', 'PROCESS_STEP');

-- CreateEnum
CREATE TYPE "FeatureAvailability" AS ENUM ('INCLUDED', 'NOT_INCLUDED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'QUOTED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('QUOTE', 'SERVICE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'OFFICE', 'APARTMENT', 'VILLA', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('PHONE', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "TechnicianStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('QUOTE_REQUEST_CREATED', 'QUOTE_STATUS_CHANGED', 'REQUEST_ASSIGNED', 'REQUEST_MESSAGE', 'CONTACT_MESSAGE', 'SYSTEM');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" "RoleName" NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "phone" VARCHAR(32),
    "whatsapp" VARCHAR(32),
    "avatar_url" VARCHAR(1024),
    "avatar_key" VARCHAR(512),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMPTZ(3),
    "last_login_at" TIMESTAMPTZ(3),
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "family_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "replaced_by_id" UUID,
    "user_agent" VARCHAR(512),
    "ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "short_description" VARCHAR(500) NOT NULL,
    "introduction" TEXT,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(64) NOT NULL DEFAULT 'wrench',
    "image_url" VARCHAR(1024),
    "image_key" VARCHAR(512),
    "og_image_url" VARCHAR(1024),
    "seo_title" VARCHAR(160),
    "seo_description" VARCHAR(320),
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "key" VARCHAR(512),
    "alt" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "type" "ServiceFeatureType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID NOT NULL,
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "badge" VARCHAR(60),
    "color" VARCHAR(9) NOT NULL DEFAULT '#0D2A5C',
    "billing_label" VARCHAR(60),
    "price_label" VARCHAR(80),
    "pricing_note" VARCHAR(255),
    "included_hours" VARCHAR(120),
    "spare_parts_coverage" VARCHAR(160),
    "free_labour" BOOLEAN NOT NULL DEFAULT false,
    "preventive_visits" VARCHAR(120),
    "maintenance_visits" VARCHAR(120),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_comparison_rows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" VARCHAR(160) NOT NULL,
    "description" VARCHAR(500),
    "icon" VARCHAR(64),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "package_comparison_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "package_id" UUID NOT NULL,
    "comparison_row_id" UUID,
    "label" VARCHAR(200) NOT NULL,
    "availability" "FeatureAvailability" NOT NULL DEFAULT 'INCLUDED',
    "value" VARCHAR(200),
    "show_on_card" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "package_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "location" VARCHAR(160),
    "summary" VARCHAR(500),
    "description" TEXT NOT NULL,
    "service_id" UUID,
    "completed_at" DATE,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "key" VARCHAR(512),
    "alt" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "company" VARCHAR(160),
    "rating" SMALLINT NOT NULL DEFAULT 5,
    "review" TEXT NOT NULL,
    "image_url" VARCHAR(1024),
    "image_key" VARCHAR(512),
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "category" VARCHAR(80),
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200),
    "subtitle" VARCHAR(500),
    "body" TEXT,
    "image_url" VARCHAR(1024),
    "image_key" VARCHAR(512),
    "items" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "content_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" VARCHAR(80) NOT NULL,
    "value" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "legal_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "legal_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reference" VARCHAR(32) NOT NULL DEFAULT generate_quote_reference(),
    "type" "RequestType" NOT NULL DEFAULT 'QUOTE',
    "status" "QuoteStatus" NOT NULL DEFAULT 'NEW',
    "customer_id" UUID,
    "service_id" UUID,
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "whatsapp" VARCHAR(32),
    "location" VARCHAR(200) NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "preferred_contact" "ContactMethod" NOT NULL,
    "description" TEXT NOT NULL,
    "additional_notes" TEXT,
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_request_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "key" VARCHAR(512) NOT NULL,
    "original_name" VARCHAR(255),
    "mime_type" VARCHAR(64) NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_request_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "from_status" "QuoteStatus",
    "to_status" "QuoteStatus" NOT NULL,
    "note" VARCHAR(500),
    "changed_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "author_id" UUID,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "request_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "technician_id" UUID NOT NULL,
    "assigned_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "sender_id" UUID,
    "from_staff" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(254),
    "phone" VARCHAR(32),
    "whatsapp" VARCHAR(32),
    "role" VARCHAR(80),
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" VARCHAR(1024),
    "image_key" VARCHAR(512),
    "status" "TechnicianStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" VARCHAR(1000),
    "link" VARCHAR(500),
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(32),
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "entity" VARCHAR(80) NOT NULL,
    "entity_id" VARCHAR(64),
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_status_sort_order_idx" ON "services"("status", "sort_order");

-- CreateIndex
CREATE INDEX "services_created_at_idx" ON "services"("created_at");

-- CreateIndex
CREATE INDEX "services_deleted_at_idx" ON "services"("deleted_at");

-- CreateIndex
CREATE INDEX "service_images_service_id_sort_order_idx" ON "service_images"("service_id", "sort_order");

-- CreateIndex
CREATE INDEX "service_features_service_id_type_sort_order_idx" ON "service_features"("service_id", "type", "sort_order");

-- CreateIndex
CREATE INDEX "service_faqs_service_id_sort_order_idx" ON "service_faqs"("service_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");

-- CreateIndex
CREATE INDEX "packages_active_sort_order_idx" ON "packages"("active", "sort_order");

-- CreateIndex
CREATE INDEX "packages_deleted_at_idx" ON "packages"("deleted_at");

-- CreateIndex
CREATE INDEX "package_comparison_rows_sort_order_idx" ON "package_comparison_rows"("sort_order");

-- CreateIndex
CREATE INDEX "package_features_package_id_sort_order_idx" ON "package_features"("package_id", "sort_order");

-- CreateIndex
CREATE INDEX "package_features_comparison_row_id_idx" ON "package_features"("comparison_row_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_features_package_id_comparison_row_id_key" ON "package_features"("package_id", "comparison_row_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_sort_order_idx" ON "projects"("status", "sort_order");

-- CreateIndex
CREATE INDEX "projects_service_id_idx" ON "projects"("service_id");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE INDEX "project_images_project_id_sort_order_idx" ON "project_images"("project_id", "sort_order");

-- CreateIndex
CREATE INDEX "testimonials_status_sort_order_idx" ON "testimonials"("status", "sort_order");

-- CreateIndex
CREATE INDEX "testimonials_deleted_at_idx" ON "testimonials"("deleted_at");

-- CreateIndex
CREATE INDEX "faqs_status_sort_order_idx" ON "faqs"("status", "sort_order");

-- CreateIndex
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "faqs_deleted_at_idx" ON "faqs"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_sections_key_key" ON "content_sections"("key");

-- CreateIndex
CREATE UNIQUE INDEX "legal_pages_slug_key" ON "legal_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "quote_requests_reference_key" ON "quote_requests"("reference");

-- CreateIndex
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "quote_requests_created_at_idx" ON "quote_requests"("created_at");

-- CreateIndex
CREATE INDEX "quote_requests_email_idx" ON "quote_requests"("email");

-- CreateIndex
CREATE INDEX "quote_requests_phone_idx" ON "quote_requests"("phone");

-- CreateIndex
CREATE INDEX "quote_requests_service_id_idx" ON "quote_requests"("service_id");

-- CreateIndex
CREATE INDEX "quote_requests_customer_id_created_at_idx" ON "quote_requests"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "quote_requests_deleted_at_idx" ON "quote_requests"("deleted_at");

-- CreateIndex
CREATE INDEX "quote_request_images_request_id_idx" ON "quote_request_images"("request_id");

-- CreateIndex
CREATE INDEX "quote_status_history_request_id_created_at_idx" ON "quote_status_history"("request_id", "created_at");

-- CreateIndex
CREATE INDEX "request_notes_request_id_created_at_idx" ON "request_notes"("request_id", "created_at");

-- CreateIndex
CREATE INDEX "request_assignments_technician_id_idx" ON "request_assignments"("technician_id");

-- CreateIndex
CREATE UNIQUE INDEX "request_assignments_request_id_technician_id_key" ON "request_assignments"("request_id", "technician_id");

-- CreateIndex
CREATE INDEX "request_messages_request_id_created_at_idx" ON "request_messages"("request_id", "created_at");

-- CreateIndex
CREATE INDEX "request_messages_read_at_idx" ON "request_messages"("read_at");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_user_id_key" ON "technicians"("user_id");

-- CreateIndex
CREATE INDEX "technicians_status_idx" ON "technicians"("status");

-- CreateIndex
CREATE INDEX "technicians_email_idx" ON "technicians"("email");

-- CreateIndex
CREATE INDEX "technicians_phone_idx" ON "technicians"("phone");

-- CreateIndex
CREATE INDEX "technicians_deleted_at_idx" ON "technicians"("deleted_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_features" ADD CONSTRAINT "service_features_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_faqs" ADD CONSTRAINT "service_faqs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_features" ADD CONSTRAINT "package_features_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_features" ADD CONSTRAINT "package_features_comparison_row_id_fkey" FOREIGN KEY ("comparison_row_id") REFERENCES "package_comparison_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_request_images" ADD CONSTRAINT "quote_request_images_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_request_images" ADD CONSTRAINT "quote_request_images_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_status_history" ADD CONSTRAINT "quote_status_history_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_status_history" ADD CONSTRAINT "quote_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_notes" ADD CONSTRAINT "request_notes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_notes" ADD CONSTRAINT "request_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_messages" ADD CONSTRAINT "request_messages_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_messages" ADD CONSTRAINT "request_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
