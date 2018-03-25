export default {getBlog,deleteBlog,postBlog,putBlog,getBlogById,paramBlog};
import auto from 'run-auto';
import mongoose from 'mongoose';
import _ from 'lodash';
const blogs = mongoose.model('blog');
const { check, validationResult } = require('express-validator/check');

function getBlog (req, res, next) {
  auto({
    blogs(cb) {
      blogs
        .find()
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
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).send({
      success: false,
      message: errors.array()[0].msg,
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
  res.send(req.blog)
}

function paramBlog (req, res, next) {
  const errors = validationResult(req)
  console.log(errors.array())
  console.log(errors.isEmpty())
  if (!errors.isEmpty()) {
    return res.status(400).send({
      success: false,
      message: errors.array()[0].msg,
      redirect: '/'
    })
  }

  auto({
    blog(cb) {
      blogs
        .findOne({_id: req.params.blogId})
        .populate('user')
        .exec(cb)
    }
  }, (error, results) => {
    if (error) return next(error)
    req.blog = results.blog
    next()
  })
}
