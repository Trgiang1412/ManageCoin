const Family = require('../models/Family');
const User = require('../models/User');
exports.getFamily = async (req, res) => {
    try {
        const userId = req.user.id;
        const family = await Family.findOne({ members: userId }).populate('members', 'name email image');
        if (!family) {
            return res.status(404).json({ message: 'Bạn chưa có gia đình.' });
        }
        res.json(family);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createFamily = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Family name is required' });
        }

        // Check if user is already in any family (either as creator or member)
        const existingFamily = await Family.findOne({ members: userId });
        if (existingFamily) {
            return res.status(400).json({ message: 'Bạn đã tham gia một gia đình. Mỗi tài khoản chỉ được ở trong 1 gia đình duy nhất.' });
        }

        const family = new Family({
            user_id: userId,
            name: name,
            members: [userId]
        });

        await family.save();

        await User.findByIdAndUpdate(userId, { family_id: family._id });

        res.status(201).json({ message: 'Tạo gia đình thành công', family });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user.id; 

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email tài khoản cần thêm' });
        }

        // Find the family where the current user is a member/creator
        const family = await Family.findOne({ members: userId });
        if (!family) {
            return res.status(404).json({ message: 'Bạn chưa có gia đình nào để thêm thành viên.' });
        }

        // Optional: Check if only the creator can add members
        if (family.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Chỉ người tạo gia đình mới có quyền thêm thành viên.' });
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
        }

        // Check if the user to add is already in a family
        const userInFamily = await Family.findOne({ members: userToAdd._id });
        if (userInFamily) {
            return res.status(400).json({ message: 'Tài khoản này đã tham gia một gia đình khác.' });
        }

        userToAdd.sendfamily = family._id;
        await userToAdd.save();

        res.json({ message: 'Đã gửi lời mời tham gia gia đình thành công', family });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.acceptInvite = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.sendfamily) {
            return res.status(400).json({ message: 'Không có lời mời nào.' });
        }

        const familyId = user.sendfamily;
        const family = await Family.findById(familyId);
        
        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại.' });
        }

        // Add user to family members if not already in
        if (!family.members.includes(userId)) {
            family.members.push(userId);
            await family.save();
        }

        // Update user state
        user.family_id = familyId;
        user.sendfamily = null;
        await user.save();

        res.json({ message: 'Tham gia gia đình thành công', family });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.rejectInvite = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.sendfamily) {
            return res.status(400).json({ message: 'Không có lời mời nào.' });
        }

        user.sendfamily = null;
        await user.save();

        res.json({ message: 'Đã từ chối lời mời vào gia đình' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
