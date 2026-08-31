CREATE TABLE IF NOT EXISTS "ai_messages" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_sessions" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"project_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"project_id" bigint,
	"client_name" varchar(255) NOT NULL,
	"value" integer NOT NULL,
	"issue_date" varchar(20) NOT NULL,
	"due_date" varchar(20) NOT NULL,
	"status" varchar(50) NOT NULL,
	"description" text,
	"asaas_id" varchar(100),
	"asaas_url" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kanban_cards" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"column_id" bigint NOT NULL,
	"title" varchar(255),
	"description" text,
	"position" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kanban_columns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"project_id" bigint NOT NULL,
	"title" varchar(255),
	"position" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"project_id" bigint,
	"message" text NOT NULL,
	"card_id" bigint,
	"to_column_id" bigint,
	"read" boolean DEFAULT false,
	"timestamp" bigint,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_updates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"project_id" bigint NOT NULL,
	"kind" varchar(50),
	"message" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" varchar(100),
	"progress" integer,
	"created_at" timestamp,
	"updated_at" timestamp,
	"client_name" varchar(255),
	"client_email" varchar(255),
	"client_phone" varchar(50),
	"project_type" varchar(100),
	"final_date" varchar(20),
	"language" varchar(50),
	"framework" varchar(50),
	"integrations" text,
	"admin_status" varchar(20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"login" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phone" varchar(50),
	"role" varchar(50),
	"created_at" timestamp,
	"updated_at" timestamp
);
