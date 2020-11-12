const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  const mostLiked = Math.max(...blogs.map((blog) => blog.likes));

  return blogs.filter((blog) => blog.likes === mostLiked)[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
