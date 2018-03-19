import blog from './blog.controller.js';

export default (app, auth, mail, settings, models, logger) => {
  // GET
  app.get('/api/blog/', blog.getBlog)
  app.get('/api/blog/:blogId', blog.getBlogById)

  // POST
  app.post('/api/blog',  blog.postBlog) //auth.isAuthenticated,

  // PUT
  app.put('/api/blog/:blogId',  blog.putBlog)// auth.isAuthorized('blog'), 
  
  // DELETE
  app.delete('/api/blog/:blogId',  blog.deleteBlog)//auth.isAuthorized('blog'),

  // PARAM
  app.param('blogId', blog.paramBlog)
};
