CREATE TYPE "public"."hostel_status_enum" AS ENUM('AVAILABLE', 'FULL', 'UNDER_MAINTENANCE');--> statement-breakpoint
ALTER TABLE "hostels" ADD COLUMN "gender" "gender_enum" DEFAULT 'MIXED';--> statement-breakpoint
ALTER TABLE "hostels" ADD COLUMN "status" "hostel_status_enum" DEFAULT 'AVAILABLE';--> statement-breakpoint
ALTER TABLE "hostels" ADD COLUMN "min_price" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "hostels" ADD COLUMN "max_price" double precision DEFAULT 0;