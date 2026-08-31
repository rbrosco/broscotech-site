ALTER TABLE "invoices" ADD COLUMN "client_document" varchar(20);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_email" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "asaas_customer_id" varchar(100);