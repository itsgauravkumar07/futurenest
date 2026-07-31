const Blog = require("../models/Blog");
const { slugify } = require("../utils/slugify");

// Ensures a slug is unique by appending -2, -3, etc. if needed
const getUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Blog.findOne(query);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

// @route  POST /api/admin/blogs
// @access Admin, Super Admin
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, categories, tags, slug, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required" });
    }

    const baseSlug = slugify(slug || title);
    const uniqueSlug = await getUniqueSlug(baseSlug);
    const publish = !!isPublished;

    const blog = await Blog.create({
      title,
      slug: uniqueSlug,
      content,
      excerpt,
      coverImage,
      author: req.user._id,
      categories: categories || [],
      tags: tags || [],
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    });

    res.status(201).json({ message: publish ? "Blog created and published" : "Blog created as draft", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
};

// @route  GET /api/admin/blogs?status=draft
// @desc   List ALL blogs (drafts + published) for the admin dashboard
// @access Admin, Super Admin
const getAllBlogsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status === "published") query.isPublished = true;
    if (status === "draft") query.isPublished = false;

    const blogs = await Blog.find(query).populate("author", "name").sort({ createdAt: -1 });
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
};

// @route  PUT /api/admin/blogs/:id
// @access Admin, Super Admin
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const editableFields = ["title", "content", "excerpt", "coverImage", "categories", "tags"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) blog[field] = req.body[field];
    });

    // Only regenerate the slug if the title changed and no explicit slug was given
    if (req.body.title !== undefined && req.body.slug === undefined) {
      const baseSlug = slugify(req.body.title);
      blog.slug = await getUniqueSlug(baseSlug, blog._id);
    } else if (req.body.slug !== undefined) {
      blog.slug = await getUniqueSlug(slugify(req.body.slug), blog._id);
    }

    await blog.save();
    res.status(200).json({ message: "Blog updated", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
};

// @route  DELETE /api/admin/blogs/:id
// @access Admin, Super Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
};

// @route  PUT /api/admin/blogs/:id/publish
// @access Admin, Super Admin
const publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.isPublished = true;
    blog.publishedAt = new Date();
    await blog.save();

    res.status(200).json({ message: "Blog published", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to publish blog", error: error.message });
  }
};

// @route  PUT /api/admin/blogs/:id/unpublish
// @access Admin, Super Admin
const unpublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.isPublished = false;
    await blog.save();

    res.status(200).json({ message: "Blog unpublished", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to unpublish blog", error: error.message });
  }
};

module.exports = { createBlog, getAllBlogsAdmin, updateBlog, deleteBlog, publishBlog, unpublishBlog };
