const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

const listWithMultipleBlogs = [
  {
    title: "Understand JavaScript's this Keyword in Depth",
    author: 'Marius Schulz',
    url:
      'https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth',
    likes: 2675,
    id: '5f6fdf9b5532ad0afe03ef16',
  },
  {
    title: 'Inversion of Control',
    author: 'Kent C. Dodds',
    url: 'https://kentcdodds.com/blog/inversion-of-control',
    likes: 2077,
    id: '5f6fe4a4e57bc010123a0508',
  },
  {
    title: 'Windows XP source code leaks online',
    author: 'Tom Warren',
    url:
      'https://www.theverge.com/2020/9/25/21455655/microsoft-windows-xp-source-code-leak',
    likes: 69420,
    id: '5f6fe530e57bc010123a0509',
  },
  {
    title: 'Windows XP source code leaks online',
    author: 'Tom Warren',
    url:
      'https://www.theverge.com/2020/9/25/21455655/microsoft-windows-xp-source-code-leak',
    likes: 120,
    id: '5f6fe530e57bc010123a0501',
  },
  {
    title: 'Windows XP source code leaks online',
    author: 'Tom Warren',
    url:
      'https://www.theverge.com/2020/9/25/21455655/microsoft-windows-xp-source-code-leak',
    likes: 1,
    id: '5f6fe530e57bc010123a0501',
  },
];

describe('Total likes', () => {
  const emptyList = [];

  const listWithOneBlog = [
    {
      title: "Understand JavaScript's this Keyword in Depth",
      author: 'Marius Schulz',
      url:
        'https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth',
      likes: 21,
      id: '5f6fdf9b5532ad0afe03ef16',
    },
  ];

  test('Amount of likes on an empty blog list is zero', () => {
    expect(listHelper.totalLikes(emptyList)).toBe(0);
  });

  test('When the list has only one blog, equals the likes of that blog', () => {
    expect(listHelper.totalLikes(listWithOneBlog)).toBe(21);
  });

  test('of a bigger list is calculated right', () => {
    expect(listHelper.totalLikes(listWithMultipleBlogs)).toBe(74293);
  });
});

describe('Most liked', () => {
  const mostLikedBlog = {
    title: 'Windows XP source code leaks online',
    author: 'Tom Warren',
    url:
      'https://www.theverge.com/2020/9/25/21455655/microsoft-windows-xp-source-code-leak',
    likes: 69420,
    id: '5f6fe530e57bc010123a0509',
  };

  test('from a pool of various blogs', () => {
    expect(listHelper.favoriteBlog(listWithMultipleBlogs)).toEqual(
      mostLikedBlog
    );
  });
});

describe('Author with most blogs', () => {
  test('from a pool of various blogs is calculated right', () => {
    expect(listHelper.mostBlogs(listWithMultipleBlogs)).toEqual({
      author: 'Tom Warren',
      blogs: 3,
    });
  });
});

describe('Author with most likes', () => {
  test('from a pool of various blogs is calculated right', () => {
    expect(listHelper.mostLikes(listWithMultipleBlogs)).toEqual({
      author: 'Tom Warren',
      likes: 69541,
    });
  });
});
