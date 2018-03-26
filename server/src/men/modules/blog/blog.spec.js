import {assert} from 'chai'
import request from 'supertest'
let blogid = ''

describe('BLOG', () => {
  describe('GET /api/blog', () => {
    it('should be returning array', done => {
      request('localhost:3000/')
        .get('api/blog')
        .expect(200, (error, res) => {
          if (error) return done(error)
          assert.isArray(res.body.blogs)
          blogid = res.body.blogs[0]._id
          done()
        })
    })
    it('should be returning object', done => {
      request('localhost:3000/')
        .get(`api/blog/${blogid}`)
        .expect(200, (error, res) => {
          if (error) return done(error)
          assert.isObject(res.body)
          done()
        })
    })
  })
})
