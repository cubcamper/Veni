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
            self.redirect('dashboard')

class GoogleCalendarLogin(web.RequestHandler):
    def get(self):
            #self.render('static/calendar.html')
            self.render('static/quickstart.html')

class GoogleCalendarAddEvent (web.RequestHandler):
    def get(self):
            self.render('static/caladdevent.html')




app = web.Application([
    (r'/login', QuizletLogin),
    (r'/callback', oAuthCallback),
    (r'/static/(.*)', web.StaticFileHandler, {'path': "static"}),
    (r'/calendar', GoogleCalendarLogin),
    (r'/calendar/addevent', GoogleCalendarAddEvent),

], debug=True)


if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.instance().start()
