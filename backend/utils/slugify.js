// Simple slugify — turns "5 Tips for First-Time Buyers!" into "5-tips-for-first-time-buyers".
// No external package needed for something this small.
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip anything that isn't a word char, space, or hyphen
    .replace(/[\s_]+/g, "-") // spaces/underscores -> hyphen
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

module.exports = { slugify };
