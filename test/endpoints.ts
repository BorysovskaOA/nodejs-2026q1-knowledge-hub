export const usersRoutes = {
  getAll: '/api/v1/user',
  getAllPaginated: '/api/v1/user/paginated',
  getById: (userId) => `/api/v1/user/${userId}`,
  create: '/api/v1/user',
  update: (userId) => `/api/v1/user/${userId}`,
  delete: (userId) => `/api/v1/user/${userId}`,
};

export const categoriesRoutes = {
  getAll: '/api/v1/category',
  getById: (categoryId) => `/api/v1/category/${categoryId}`,
  create: '/api/v1/category',
  update: (categoryId) => `/api/v1/category/${categoryId}`,
  delete: (categoryId) => `/api/v1/category/${categoryId}`,
};

export const articlesRoutes = {
  getAll: '/api/v1/article',
  getAllPaginated: '/api/v1/article/paginated',
  getById: (articleId) => `/api/v1/article/${articleId}`,
  create: '/api/v1/article',
  update: (articleId) => `/api/v1/article/${articleId}`,
  delete: (articleId) => `/api/v1/article/${articleId}`,
};

export const commentsRoutes = {
  getByArticle: (articleId) => `/api/v1/comment?articleId=${articleId}`,
  getAllPaginatedByArticle: (articleId) =>
    `/api/v1/comment/paginated?articleId=${articleId}`,
  getById: (commentId) => `/api/v1/comment/${commentId}`,
  create: '/api/v1/comment',
  delete: (commentId) => `/api/v1/comment/${commentId}`,
};

export const authRoutes = {
  signup: '/api/v1/auth/signup',
  login: '/api/v1/auth/login',
  refresh: '/api/v1/auth/refresh',
};
