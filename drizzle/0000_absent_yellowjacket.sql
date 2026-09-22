CREATE TABLE "order_final_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"preview_url" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_final_files_order_id_unique" UNIQUE("order_id")
);
