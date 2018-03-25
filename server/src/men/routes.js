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
        res.send(`
            <!doctype html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" xmlns:og="http://opengraphprotocol.org/schema/" lang="en">
            <head  prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
                <base href="/">
                <title >Men Stack JS</title>
                <meta charset="utf-8"/>
                <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <meta name="fragment" content="!"/>
                <meta http-equiv="Content-type" content="text/html;charset=UTF-8"/>   
            </head>
            <body>    
                <div>
                    <h1>Men Stack API Page</h1>
                    <p>Here are just some of the routes in the system to help you get started. </p>
                    <a href="http://localhost:3000/api/blog">Blog API</a><br>                    
                    <a href="http://localhost:3000/api/user">User API</a><br>                    
                </div>
            </body>
            </html>
        `)
    })
    self.app.get('/*', function (req, res, next) {
        res.redirect('/')
    })
}
export {routes};