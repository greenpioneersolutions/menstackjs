export {getBlog};
export {deleteBlog};
export {postBlog};
export {putBlog};
export {getBlogById};
export {paramBlog};
import auto from 'run-auto';
import mongoose from 'mongoose';
const blogs = mongoose.model('blog');
import _ from 'lodash';

function getBlog (req, res, next) {
  console.log('start getBlog')
  auto({
    blogs(cb) {
      blogs
        .find()
        // .where(req.queryParameters.where || '')
        // .sort(req.queryParameters.sort || '')
        // .select(req.queryParameters.select || '')
        // .limit(req.queryParameters.limit || '')
        // .skip(req.queryParameters.skip || '')
        // .populate(req.queryParameters.populateId || 'user', req.queryParameters.populateItems || '')
        .exec(cb)
    },
    count(cb) {
      blogs
        .find()
        .count()
        .exec(cb)
    }
  }, (error, results) => {
    if (error) return next(error)
    console.log('end getBlog')
    return res.status(200).send(results)
  })
}

function deleteBlog (req, res, next) {
  req.blog.remove(error => {
    if (error) return next(error)
    res.status(204).send()
  })
}

function postBlog (req, res, next) {
  // EX. of how to use express validator
  // req.assert('name', 'The name cannot be blank').notEmpty()
  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      success: false,
      message: errors[0].message,
      redirect: '/'
    })
  }

  req.body.user = req.user._id
  blogs.create(req.body, (error, data) => {
    if (error) return next(error)
    return res.status(201).send(data)
  })
}

function putBlog (req, res, next) {
  req.blog = _.assign(req.blog, req.body)
  req.blog.save(error => {
    if (error) return next(error)
    return res.status(200).send(req.blog)
  })
}

function getBlogById (req, res, next) {
  console.log('start getBlogById')
  res.send(req.blog)
  console.log('end getBlogById')
}

function paramBlog (req, res, next, id) {
  console.log('start paramBlog')

  req.assert('blogId', 'Your Blog ID cannot be blank').notEmpty()
  req.assert('blogId', 'Your Blog ID has to be a real id').isMongoId()

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      success: false,
      message: errors[0].message,
      redirect: '/'
    })
  }

  auto({
    blog(cb) {
      blogs
        .findOne({_id: id})
        .populate('user')
        .exec(cb)
    }
  }, (error, results) => {
    if (error) return next(error)
    req.blog = results.blog
    console.log('end paramBlog')
    next()
  })
}
