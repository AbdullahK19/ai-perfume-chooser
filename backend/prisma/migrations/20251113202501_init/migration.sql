-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "emailHash" VARCHAR(64) NOT NULL,
    "phoneHash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfumes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "genderMarketing" VARCHAR(50) NOT NULL,
    "priceTier" VARCHAR(50) NOT NULL,
    "approximatePrice" DOUBLE PRECISION,
    "releaseYear" INTEGER,
    "concentration" VARCHAR(50),
    "intensityTag" VARCHAR(50) NOT NULL,
    "seasonTags" VARCHAR(50)[],
    "climateTags" VARCHAR(50)[],
    "sourceId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "noteFamily" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfume_notes" (
    "id" TEXT NOT NULL,
    "perfumeId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "noteLevel" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfume_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_emailHash_key" ON "users"("emailHash");

-- CreateIndex
CREATE INDEX "login_codes_userId_idx" ON "login_codes"("userId");

-- CreateIndex
CREATE INDEX "login_codes_code_expiresAt_idx" ON "login_codes"("code", "expiresAt");

-- CreateIndex
CREATE INDEX "usage_events_userId_idx" ON "usage_events"("userId");

-- CreateIndex
CREATE INDEX "usage_events_createdAt_idx" ON "usage_events"("createdAt");

-- CreateIndex
CREATE INDEX "usage_events_eventType_idx" ON "usage_events"("eventType");

-- CreateIndex
CREATE INDEX "perfumes_brand_idx" ON "perfumes"("brand");

-- CreateIndex
CREATE INDEX "perfumes_priceTier_idx" ON "perfumes"("priceTier");

-- CreateIndex
CREATE INDEX "perfumes_intensityTag_idx" ON "perfumes"("intensityTag");

-- CreateIndex
CREATE UNIQUE INDEX "notes_name_key" ON "notes"("name");

-- CreateIndex
CREATE INDEX "notes_noteFamily_idx" ON "notes"("noteFamily");

-- CreateIndex
CREATE INDEX "perfume_notes_perfumeId_idx" ON "perfume_notes"("perfumeId");

-- CreateIndex
CREATE INDEX "perfume_notes_noteId_idx" ON "perfume_notes"("noteId");

-- CreateIndex
CREATE INDEX "perfume_notes_noteLevel_idx" ON "perfume_notes"("noteLevel");

-- CreateIndex
CREATE UNIQUE INDEX "perfume_notes_perfumeId_noteId_key" ON "perfume_notes"("perfumeId", "noteId");

-- AddForeignKey
ALTER TABLE "login_codes" ADD CONSTRAINT "login_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfume_notes" ADD CONSTRAINT "perfume_notes_perfumeId_fkey" FOREIGN KEY ("perfumeId") REFERENCES "perfumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfume_notes" ADD CONSTRAINT "perfume_notes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
