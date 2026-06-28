/**
 * Migration Script: Multi-Family Support
 * 
 * Converts User documents:
 *   - family_id: ObjectId  → family_id: [ObjectId]
 *   - sendfamily: ObjectId → sendfamily: [ObjectId]
 *   - Adds active_family_id = family_id (if existed)
 * 
 * Run once: node migrate_family.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/managecoin';

async function migrate() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();
    console.log(`📋 Found ${users.length} user(s) to check.\n`);

    let migratedCount = 0;

    for (const user of users) {
        const updates = {};
        let needsUpdate = false;

        // --- Migrate family_id: ObjectId → [ObjectId] ---
        if (user.family_id !== undefined && user.family_id !== null) {
            // Check if it's already an array
            if (!Array.isArray(user.family_id)) {
                updates.family_id = [user.family_id];
                // Set active_family_id to the existing family
                if (!user.active_family_id) {
                    updates.active_family_id = user.family_id;
                }
                needsUpdate = true;
                console.log(`  → User "${user.name}" (${user._id}): family_id converted to array [${user.family_id}]`);
            } else if (Array.isArray(user.family_id) && user.family_id.length > 0 && !user.active_family_id) {
                // Array already but no active_family_id set
                updates.active_family_id = user.family_id[0];
                needsUpdate = true;
                console.log(`  → User "${user.name}" (${user._id}): active_family_id set to ${user.family_id[0]}`);
            }
        } else {
            // No family_id - ensure it's an empty array
            if (!Array.isArray(user.family_id)) {
                updates.family_id = [];
                needsUpdate = true;
            }
        }

        // --- Migrate sendfamily: ObjectId → [ObjectId] ---
        if (user.sendfamily !== undefined && user.sendfamily !== null) {
            if (!Array.isArray(user.sendfamily)) {
                updates.sendfamily = [user.sendfamily];
                needsUpdate = true;
                console.log(`  → User "${user.name}" (${user._id}): sendfamily converted to array`);
            }
        } else {
            if (!Array.isArray(user.sendfamily)) {
                updates.sendfamily = [];
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: updates }
            );
            migratedCount++;
        }
    }

    console.log(`\n✅ Migration complete. Updated ${migratedCount} user(s).`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
