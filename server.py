from tornado import web, template, ioloop, httpclient
#import requests
import json
import random
import string

print("restarting")

conf = json.loads(open("config.json").read())

def id_generator(size=6, chars=string.ascii_lowercase + string.digits): #Generates a random ID
    return ''.join(random.choice(chars) for _ in range(size))


class QuizletLogin(web.RequestHandler):
    def get(self):
        #print(self.render_string('login.html', state="TESTEST"))
        #template.Template().generate(statecode = id_generator())
        state = id_generator()
        self.set_cookie("csrf", state)
        self.render('static/login.html', state= state, host = conf['hostname'], qid = conf["q_key"])


class oAuthCallback(web.RequestHandler):

    def get(self):
        code = self.get_argument('code', None)
        if code == None:
            self.redirect("dashboard")
            return


        url = 'https://api.quizlet.com/oauth/token?redirect_uri=http://'+conf['hostname']+'/callback'

        request = httpclient.HTTPRequest(url,method='POST',auth_username=conf['q_key'],auth_password=conf['q_sec'],body="grant_type=authorization_code&code="+code)
        client = httpclient.HTTPClient()
        client.fetch(request, callback=self.callback)

    def callback(self, response):
        if response.error:
            print( "Error:", response.error)
        else:
            myjson = json.loads(response.body.decode())

            if self.get_argument("state") != self.get_cookie("csrf"):
                self.write("error")
                return
            else:
                self.set_cookie("csrf", "")

            uid = id_generator(size=16)
            self.set_cookie('token', myjson['access_token'])
            self.set_cookie('username', myjson['user_id'])

            print("Logged in!", uid)
            self.redirect('home')

class HomeHandler(web.RequestHandler):
    def get(self, *args, **kwargs ):
        username = self.get_cookie("username", None)

        if username == None:
            print("User not logged in")
            self.render("static/loggedout.html")
        else:
            print("User logged in")
            self.render("static/main.html")

class GoogleCalendarLogin(web.RequestHandler):
    def get(self):
            #self.render('static/calendar.html')
            self.render('static/quickstart.html')




app = web.Application([
    (r'/', HomeHandler),
    (r'/login', QuizletLogin),
    (r'/callback', oAuthCallback),
    (r'/home', HomeHandler),
    (r'/css/(.*)', web.StaticFileHandler, {'path': "static/css"}),
    (r'/js/(.*)', web.StaticFileHandler, {'path': "static/js"}),
    (r'/img/(.*)', web.StaticFileHandler, {'path': "static/img"}),
    (r'/calendar', GoogleCalendarLogin)

], debug=True)


if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.instance().start()
