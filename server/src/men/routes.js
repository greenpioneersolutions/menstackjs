function routes (self) {
    for(let i =0; i < self.files.routes.length; i++){
        require(self.files.routes[i])(self.app, self.middleware, self.mail, self.settings, self.models, self.logger)
    }
    self.app.get('/:url(api|modules)/*', function (req, res) {
        res.status(404).send({
            error: 'nothing found at ' + req.path
        })
    })
    self.app.get('/', function (req, res, next) {
        res.send('MAIN FILES')
    })
    self.app.get('/*', function (req, res, next) {
        res.redirect('/').send()
    })
}
export default routes;