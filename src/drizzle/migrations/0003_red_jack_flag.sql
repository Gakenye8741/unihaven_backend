CREATE TYPE "public"."gender_enum" AS ENUM('MALE', 'FEMALE', 'MIXED');--> statement-breakpoint
ALTER TABLE "hostels" ADD COLUMN "location" varchar(255) NOT NULL;