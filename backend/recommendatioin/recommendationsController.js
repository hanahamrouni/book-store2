// controllers/recommendationsController.js
const Book = require('../models/Book'); // استيراد نموذج الكتاب من MongoDB

const getRecommendations = async (req, res) => {
    try {
        const user = req.user; // المستخدم الحالي
        const lastBook = await Book.findOne({ _id: user.lastViewedBook }); // آخر كتاب شاهده المستخدم

        if (!lastBook) {
            return res.status(200).json([]); // إذا لم يشاهد المستخدم أي كتاب، نرجع قائمة فارغة
        }

        // اقتراح كتب من نفس الفئة
        const recommendations = await Book.find({ category: lastBook.category, _id: { $ne: lastBook._id } }).limit(5);
        res.status(200).json(recommendations); // إرجاع التوصيات
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate recommendations' });
    }
};

module.exports = { getRecommendations };