const Family = require('../models/Family');
const User = require('../models/User');

// GET /family - Lấy family đang active của user
exports.getFamily = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.active_family_id) {
            return res.status(404).json({ message: 'Bạn chưa chọn gia đình nào.' });
        }

        const family = await Family.findOne({
            _id: user.active_family_id,
            members: userId
        }).populate('members', 'name email image');

        if (!family) {
            return res.status(404).json({ message: 'Không tìm thấy gia đình.' });
        }

        res.json(family);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET /family/all - Lấy tất cả family của user
exports.getMyFamilies = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const families = await Family.find({ members: userId })
            .populate('members', 'name email image');

        res.json({
            families,
            active_family_id: user.active_family_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST /family - Tạo family mới (cho phép tạo nhiều)
exports.createFamily = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Family name is required' });
        }

        const family = new Family({
            user_id: userId,
            name: name,
            members: [userId]
        });

        await family.save();

        // Thêm family vào mảng family_id và set là active
        await User.findByIdAndUpdate(userId, {
            $addToSet: { family_id: family._id },
            $set: { active_family_id: family._id }
        });

        res.status(201).json({ message: 'Tạo gia đình thành công', family });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST /family/switch - Đổi active family
exports.switchFamily = async (req, res) => {
    try {
        const { family_id } = req.body;
        const userId = req.user.id;

        if (!family_id) {
            return res.status(400).json({ message: 'family_id is required' });
        }

        // Kiểm tra user có phải thành viên của family không
        const family = await Family.findOne({ _id: family_id, members: userId });
        if (!family) {
            return res.status(403).json({ message: 'Bạn không phải thành viên của gia đình này.' });
        }

        await User.findByIdAndUpdate(userId, { active_family_id: family_id });

        res.json({ message: 'Đã chuyển gia đình thành công', family_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST /family/add-member - Mời thành viên (chủ nhóm gửi lời mời)
exports.addMember = async (req, res) => {
    try {
        const { email, family_id } = req.body;
        const userId = req.user.id;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email tài khoản cần thêm' });
        }

        // Tìm family: nếu không truyền family_id thì dùng active family
        let targetFamilyId = family_id;
        if (!targetFamilyId) {
            const user = await User.findById(userId);
            targetFamilyId = user.active_family_id;
        }

        const family = await Family.findOne({ _id: targetFamilyId, members: userId });
        if (!family) {
            return res.status(404).json({ message: 'Không tìm thấy gia đình hoặc bạn không phải thành viên.' });
        }

        // Chỉ chủ nhóm mới được mời
        if (family.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Chỉ người tạo gia đình mới có quyền thêm thành viên.' });
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
        }

        // Kiểm tra đã là thành viên chưa
        if (family.members.map(m => m.toString()).includes(userToAdd._id.toString())) {
            return res.status(400).json({ message: 'Tài khoản này đã là thành viên của gia đình.' });
        }

        // Kiểm tra đã có lời mời chưa
        const alreadyInvited = (userToAdd.sendfamily || []).map(f => f.toString()).includes(family._id.toString());
        if (alreadyInvited) {
            return res.status(400).json({ message: 'Đã gửi lời mời cho tài khoản này rồi.' });
        }

        // Thêm vào mảng sendfamily
        await User.findByIdAndUpdate(userToAdd._id, {
            $addToSet: { sendfamily: family._id }
        });

        res.json({ message: 'Đã gửi lời mời tham gia gia đình thành công', family });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST /family/accept-invite - Chấp nhận lời mời
exports.acceptInvite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { family_id } = req.body;

        const user = await User.findById(userId);

        if (!user.sendfamily || user.sendfamily.length === 0) {
            return res.status(400).json({ message: 'Không có lời mời nào.' });
        }

        // Nếu truyền family_id thì accept đúng lời mời đó, không thì accept cái đầu tiên
        let familyId = family_id;
        if (!familyId) {
            familyId = user.sendfamily[0];
        }

        // Kiểm tra lời mời này có trong danh sách không
        const hasInvite = user.sendfamily.map(f => f.toString()).includes(familyId.toString());
        if (!hasInvite) {
            return res.status(400).json({ message: 'Lời mời không tồn tại.' });
        }

        const family = await Family.findById(familyId);
        if (!family) {
            // Family bị xóa → xóa lời mời
            await User.findByIdAndUpdate(userId, {
                $pull: { sendfamily: familyId }
            });
            return res.status(404).json({ message: 'Gia đình không tồn tại.' });
        }

        // Thêm user vào members nếu chưa có
        if (!family.members.map(m => m.toString()).includes(userId.toString())) {
            family.members.push(userId);
            await family.save();
        }

        // Cập nhật user: thêm vào family_id array, xóa khỏi sendfamily, set active nếu chưa có
        const updateObj = {
            $addToSet: { family_id: familyId },
            $pull: { sendfamily: familyId }
        };

        await User.findByIdAndUpdate(userId, updateObj);

        // Set active_family_id nếu chưa có
        const updatedUser = await User.findById(userId);
        if (!updatedUser.active_family_id) {
            await User.findByIdAndUpdate(userId, { active_family_id: familyId });
        }

        res.json({ message: 'Tham gia gia đình thành công', family });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST /family/reject-invite - Từ chối lời mời
exports.rejectInvite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { family_id } = req.body;

        const user = await User.findById(userId);

        if (!user.sendfamily || user.sendfamily.length === 0) {
            return res.status(400).json({ message: 'Không có lời mời nào.' });
        }

        let familyId = family_id;
        if (!familyId) {
            familyId = user.sendfamily[0];
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { sendfamily: familyId }
        });

        res.json({ message: 'Đã từ chối lời mời vào gia đình' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// POST /family/:familyId/leave - Thành viên tự rời family
exports.leaveFamily = async (req, res) => {
    try {
        const userId = req.user.id;
        const { familyId } = req.params;

        const family = await Family.findById(familyId);
        if (!family) {
            return res.status(404).json({ message: 'Không tìm thấy gia đình.' });
        }

        // Chủ nhóm không được tự rời (phải giải tán)
        if (family.user_id.toString() === userId.toString()) {
            return res.status(400).json({ message: 'Chủ nhóm không thể tự rời nhóm. Vui lòng giải tán nhóm.' });
        }

        // Xóa user khỏi members
        family.members = family.members.filter(m => m.toString() !== userId.toString());
        await family.save();

        // Xóa family khỏi user
        await User.findByIdAndUpdate(userId, {
            $pull: { family_id: family._id }
        });

        // Nếu active_family_id là family này → reset về family đầu tiên còn lại hoặc null
        const user = await User.findById(userId);
        if (user.active_family_id && user.active_family_id.toString() === familyId.toString()) {
            const newActive = user.family_id.length > 0 ? user.family_id[0] : null;
            await User.findByIdAndUpdate(userId, { active_family_id: newActive });
        }

        res.json({ message: 'Đã rời gia đình thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// DELETE /family/:familyId/member/:memberId - Chủ nhóm xóa thành viên
exports.removeMember = async (req, res) => {
    try {
        const userId = req.user.id;
        const { familyId, memberId } = req.params;

        const family = await Family.findById(familyId);
        if (!family) {
            return res.status(404).json({ message: 'Không tìm thấy gia đình.' });
        }

        // Chỉ chủ nhóm mới được xóa thành viên
        if (family.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Chỉ chủ nhóm mới có quyền xóa thành viên.' });
        }

        // Không thể xóa chính mình
        if (memberId === userId.toString()) {
            return res.status(400).json({ message: 'Không thể xóa chính mình khỏi nhóm.' });
        }

        // Xóa khỏi members
        family.members = family.members.filter(m => m.toString() !== memberId.toString());
        await family.save();

        // Xóa family khỏi member's family_id
        await User.findByIdAndUpdate(memberId, {
            $pull: { family_id: family._id }
        });

        // Reset active nếu member đang active family này
        const member = await User.findById(memberId);
        if (member && member.active_family_id && member.active_family_id.toString() === familyId.toString()) {
            const newActive = member.family_id.length > 0 ? member.family_id[0] : null;
            await User.findByIdAndUpdate(memberId, { active_family_id: newActive });
        }

        res.json({ message: 'Đã xóa thành viên khỏi gia đình' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// DELETE /family/:familyId - Giải tán family (chủ nhóm)
exports.dissolveFamily = async (req, res) => {
    try {
        const userId = req.user.id;
        const { familyId } = req.params;

        const family = await Family.findById(familyId);
        if (!family) {
            return res.status(404).json({ message: 'Không tìm thấy gia đình.' });
        }

        // Chỉ chủ nhóm mới được giải tán
        if (family.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Chỉ chủ nhóm mới có quyền giải tán gia đình.' });
        }

        const memberIds = family.members.map(m => m.toString());

        // Xóa family khỏi tất cả members
        await User.updateMany(
            { _id: { $in: memberIds } },
            { $pull: { family_id: family._id } }
        );

        // Reset active_family_id cho các member đang dùng family này
        for (const mid of memberIds) {
            const member = await User.findById(mid);
            if (member && member.active_family_id && member.active_family_id.toString() === familyId.toString()) {
                const newActive = member.family_id.length > 0 ? member.family_id[0] : null;
                await User.findByIdAndUpdate(mid, { active_family_id: newActive });
            }
        }

        // Xóa family document
        await Family.findByIdAndDelete(familyId);

        res.json({ message: 'Đã giải tán gia đình thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
