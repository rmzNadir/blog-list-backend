const _ = require('lodash');

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

const mostBlogs = (blogs) => {
  const blogsPerAuthor = _.countBy(blogs, 'author');
  const author = _.max(
    Object.keys(blogsPerAuthor),
    (Author) => blogsPerAuthor[Author]
  );
  // console.log('blogsPerAuthor', blogsPerAuthor);
  // console.log('Author', Author);
  const obj = {
    author: author,
    blogs: blogsPerAuthor[author],
  };
  return obj;
};

const mostLikes = (blogs) => {
  const likesPerAuthor = _(blogs)
    .groupBy('author')
    .map((objs, key) => ({
      author: key,
      likes: _.sumBy(objs, 'likes'),
    }))
    .value();

  const author = _.maxBy(likesPerAuthor, (object) => object.likes);
  // console.log('likesPerAuthor', likesPerAuthor);
  // console.log('author', author);
  return { ...author };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
