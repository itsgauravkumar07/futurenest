const Blog = require("../models/Blog");

// @route  GET /api/blogs?category=&tag=&search=&page=&limit=
// @desc   Public: browse published blogs only
// @access Public
const getPublicBlogs = async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { excerpt: new RegExp(search, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select("title slug excerpt coverImage categories tags publishedAt author")
        .populate("author", "name")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      blogs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
};

// @route  GET /api/blogs/:slug
// @access Public
const getPublicBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).populate(
      "author",
      "name"
    );

    if (!blog) return res.status(404).json({ message: "Blog post not found" });

    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blog post", error: error.message });
  }
};

module.exports = { getPublicBlogs, getPublicBlogBySlug };
