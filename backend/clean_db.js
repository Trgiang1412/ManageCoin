const mongoose = require('mongoose');
const Category = require('./models/Category');
const List = require('./models/List');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const standardCategories = ['Thu nhập', 'Ăn uống', 'Di chuyển', 'Mua sắm', 'Tiết kiệm', 'Khác'];

        // Get all users
        const users = await User.find();

        for (const user of users) {
            console.log(`Processing user ${user.email}...`);

            // Find categories for this user that are NOT in the standard list
            const badCategories = await Category.find({
                user_id: user.id,
                category_name: { $nin: standardCategories }
            });

            // Make sure standard categories exist
            let otherCategory = await Category.findOne({ user_id: user.id, category_name: 'Khác' });
            if (!otherCategory) {
                otherCategory = new Category({ user_id: user.id, category_name: 'Khác', type_category: 'expense' });
                await otherCategory.save();
            }

            for (const cat of badCategories) {
                // Update all lists referencing this bad category to point to 'Khác'
                await List.updateMany({ id_category: cat._id }, {
                    id_category: otherCategory._id,
                    category_name: 'Khác'
                });
                // Delete the bad category
                await Category.deleteOne({ _id: cat._id });
            }

            // Ensure all default categories exist
            const defaults = [
                { category_name: 'Thu nhập', type_category: 'income' },
                { category_name: 'Ăn uống', type_category: 'expense' },
                { category_name: 'Di chuyển', type_category: 'expense' },
                { category_name: 'Mua sắm', type_category: 'expense' },
                { category_name: 'Tiết kiệm', type_category: 'expense' },
                { category_name: 'Khác', type_category: 'expense' }
            ];

            for (const def of defaults) {
                const exists = await Category.findOne({ user_id: user.id, category_name: def.category_name });
                if (!exists) {
                    await new Category({ user_id: user.id, ...def }).save();
                }
            }

            // Also deduplicate categories if any exist multiple times
            for (const def of defaults) {
                const duplicates = await Category.find({ user_id: user.id, category_name: def.category_name });
                if (duplicates.length > 1) {
                    const keep = duplicates[0];
                    for (let i = 1; i < duplicates.length; i++) {
                        await List.updateMany({ id_category: duplicates[i]._id }, { id_category: keep._id });
                        await Category.deleteOne({ _id: duplicates[i]._id });
                    }
                }
            }
        }

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanDB();
