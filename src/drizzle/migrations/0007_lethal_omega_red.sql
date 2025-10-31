ALTER TYPE "public"."post_type" ADD VALUE 'HOSTEL_UPDATE';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'REGULAR';--> statement-breakpoint
ALTER TABLE "ads" DROP CONSTRAINT "ads_advertiser_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ads" ALTER COLUMN "end_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "floor" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "price_per_month" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "amenities" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "image_url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_advertiser_id_advertisers_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."advertisers"("id") ON DELETE cascade ON UPDATE no action;