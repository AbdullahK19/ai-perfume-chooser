import prisma from './db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test Script: Demonstrates Prisma CRUD operations
 *
 * This script will:
 * 1. Create some notes (bergamot, cedar, sandalwood)
 * 2. Create a perfume (Bleu de Chanel)
 * 3. Link the perfume to notes with levels (top/heart/base)
 * 4. Query the perfume with all its notes
 * 5. Create a user
 * 6. Create a login code for that user
 */

async function main() {
  console.log('🚀 Starting database test...\n');

  // ============================================
  // 1. CREATE NOTES
  // ============================================
  console.log('📝 Creating notes...');

  const bergamot = await prisma.note.create({
    data: {
      name: 'Bergamot',
      noteFamily: 'citrus',
    },
  });
  console.log(`✅ Created note: ${bergamot.name} (${bergamot.noteFamily})`);

  const cedar = await prisma.note.create({
    data: {
      name: 'Cedar',
      noteFamily: 'woody',
    },
  });
  console.log(`✅ Created note: ${cedar.name} (${cedar.noteFamily})`);

  const sandalwood = await prisma.note.create({
    data: {
      name: 'Sandalwood',
      noteFamily: 'woody',
    },
  });
  console.log(`✅ Created note: ${sandalwood.name} (${sandalwood.noteFamily})\n`);

  // ============================================
  // 2. CREATE A PERFUME
  // ============================================
  console.log('🌸 Creating perfume...');

  const perfume = await prisma.perfume.create({
    data: {
      name: 'Bleu de Chanel',
      brand: 'Chanel',
      genderMarketing: 'masculine',
      priceTier: 'niche',
      approximatePrice: 135.0,
      releaseYear: 2010,
      concentration: 'EDP',
      intensityTag: 'moderate',
      seasonTags: ['fall', 'winter', 'spring'],
      climateTags: ['cold', 'mild'],
    },
  });
  console.log(`✅ Created perfume: ${perfume.name} by ${perfume.brand}`);
  console.log(`   Price: $${perfume.approximatePrice}, Released: ${perfume.releaseYear}`);
  console.log(`   Seasons: ${perfume.seasonTags.join(', ')}`);
  console.log(`   Climate: ${perfume.climateTags.join(', ')}\n`);

  // ============================================
  // 3. LINK PERFUME TO NOTES
  // ============================================
  console.log('🔗 Linking perfume to notes...');

  await prisma.perfumeNote.create({
    data: {
      perfumeId: perfume.id,
      noteId: bergamot.id,
      noteLevel: 'top',
    },
  });
  console.log('✅ Linked Bergamot as TOP note');

  await prisma.perfumeNote.create({
    data: {
      perfumeId: perfume.id,
      noteId: cedar.id,
      noteLevel: 'heart',
    },
  });
  console.log('✅ Linked Cedar as HEART note');

  await prisma.perfumeNote.create({
    data: {
      perfumeId: perfume.id,
      noteId: sandalwood.id,
      noteLevel: 'base',
    },
  });
  console.log('✅ Linked Sandalwood as BASE note\n');

  // ============================================
  // 4. QUERY PERFUME WITH NOTES
  // ============================================
  console.log('🔍 Querying perfume with all related notes...');

  const perfumeWithNotes = await prisma.perfume.findUnique({
    where: { id: perfume.id },
    include: {
      perfumeNotes: {
        include: {
          note: true, // Include the actual Note data
        },
      },
    },
  });

  console.log(`\n📦 ${perfumeWithNotes?.name} - Complete Profile:`);
  console.log(`   Brand: ${perfumeWithNotes?.brand}`);
  console.log(`   Notes:`);
  perfumeWithNotes?.perfumeNotes.forEach((pn) => {
    console.log(`     - ${pn.noteLevel.toUpperCase()}: ${pn.note.name} (${pn.note.noteFamily})`);
  });

  // ============================================
  // 5. CREATE A USER
  // ============================================
  console.log('\n👤 Creating a user...');

  const user = await prisma.user.create({
    data: {
      emailHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA-256 of empty string (example)
      phoneHash: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9', // SHA-256 of "0" (example)
    },
  });
  console.log(`✅ Created user with ID: ${user.id}`);

  // ============================================
  // 6. CREATE A LOGIN CODE FOR USER
  // ============================================
  console.log('\n🔐 Creating login code...');

  const fiveMinutesFromNow = new Date();
  fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);

  const loginCode = await prisma.loginCode.create({
    data: {
      userId: user.id,
      code: '123456',
      expiresAt: fiveMinutesFromNow,
    },
  });
  console.log(`✅ Created login code: ${loginCode.code}`);
  console.log(`   Expires at: ${loginCode.expiresAt.toISOString()}`);
  console.log(`   Consumed: ${loginCode.consumed}`);

  // ============================================
  // 7. QUERY USER WITH LOGIN CODES
  // ============================================
  console.log('\n🔍 Querying user with all login codes...');

  const userWithCodes = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      loginCodes: true,
    },
  });

  console.log(`\n👤 User: ${userWithCodes?.id}`);
  console.log(`   Email hash: ${userWithCodes?.emailHash.substring(0, 16)}...`);
  console.log(`   Login codes: ${userWithCodes?.loginCodes.length}`);
  userWithCodes?.loginCodes.forEach((code) => {
    console.log(`     - Code: ${code.code}, Expires: ${code.expiresAt.toLocaleString()}`);
  });

  // ============================================
  // 8. FIND ALL PERFUMES WITH SPECIFIC NOTE
  // ============================================
  console.log('\n🔍 Finding all perfumes that contain Bergamot...');

  const perfumesWithBergamot = await prisma.perfume.findMany({
    where: {
      perfumeNotes: {
        some: {
          note: {
            name: 'Bergamot',
          },
        },
      },
    },
    include: {
      perfumeNotes: {
        include: {
          note: true,
        },
      },
    },
  });

  console.log(`\n✅ Found ${perfumesWithBergamot.length} perfume(s) with Bergamot:`);
  perfumesWithBergamot.forEach((p) => {
    console.log(`   - ${p.name} by ${p.brand}`);
  });

  console.log('\n✅ Database test complete!');
}

/**
 * EXECUTION
 *
 * Run the main function and handle any errors
 */
main()
  .catch((error) => {
    console.error('❌ Error during database test:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    // Always disconnect from the database when done
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  });