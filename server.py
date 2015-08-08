from tornado import web, template, ioloop, httpclient
import requests
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
            self.redirect("home")
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

class GoogleCalendarLogin(web.RequestHandler):
    def get(self):
            #self.render('static/calendar.html')
            self.render('static/quickstart.html')

class GoogleCalendarAddEvent (web.RequestHandler):
    def get(self):
            self.render('static/caladdevent.html')

class HomeHandler(web.RequestHandler):
    def get(self, *args, **kwargs ):
        username = self.get_cookie("username", None)

        if username == None:
            print("User not logged in")
            self.render("static/lo.html", num=random.randint(1,10))
        else:
            print("User logged in")
            self.render("static/main.html", user=username)

class FlashHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        set = self.get_argument("s", None, True)
        if(set == None):
            j = self.getQuizlet()[:16]

            l1 = []
            l2 = []

            i = 1
            for l in j:
                if i % 2 == 0:
                    l2.append(l)
                else:
                    l1.append(l)
                i+=1

            self.render("static/sets.html", l1=l1, l2=l2)

            pass
        else:

            print(set)
            terms = self.getSets(set)

            #print(terms)
            print(terms['terms'])
            self.render("static/fc.html", url=terms['url'], title=terms['title'], i=terms['terms'])
            #https://api.quizlet.com/2.0/sets/SET_ID/terms






    def getQuizlet(self):
            username = self.get_cookie("username")
            url = "https://api.quizlet.com/2.0/users/"+username+"/sets?client_id="+conf['q_key']+"&access_token="+self.get_cookie("token")
            request = httpclient.HTTPRequest(url)
            client = httpclient.HTTPClient()

            myjson = json.loads(client.fetch(request).body.decode())
            return myjson

    def getSets(self, s):
            url = "https://api.quizlet.com/2.0/sets/"+s+"?client_id="+conf['q_key']+"&access_token="+self.get_cookie("token")
            request = httpclient.HTTPRequest(url)
            client = httpclient.HTTPClient()

            myjson = json.loads(client.fetch(request).body.decode())
            return myjson

class TipHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        self.render("static/study.html")

class ToDoHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        self.render("static/todo.html")

class YogaHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        self.render("static/yoga.html")

class LogoutHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        self.render("static/logout.html")

app = web.Application([
    (r'/', HomeHandler),
    (r'/home', HomeHandler),
    (r'/login', QuizletLogin),
    (r'/callback', oAuthCallback),
    (r'/static/(.*)', web.StaticFileHandler, {'path': "static"}),
    (r'/flashcards', FlashHandler),
    (r'/flashcards/(.*)', FlashHandler),
    (r'/tips', TipHandler),
    (r'/yoga', YogaHandler),
    (r'/logout', LogoutHandler),
    (r'/todo', ToDoHandler),
    (r'/calendar', GoogleCalendarLogin),
    (r'/calendar/addevent', GoogleCalendarAddEvent),
    (r'/css/(.*)', web.StaticFileHandler, {'path': "static/css"}),
    (r'/audio/(.*)', web.StaticFileHandler, {'path': "static/audio"}),
    (r'/js/(.*)', web.StaticFileHandler, {'path': "static/js"}),
    (r'/img/(.*)', web.StaticFileHandler, {'path': "static/img"}),
    (r'/fonts/(.*)', web.StaticFileHandler, {'path': "static/fonts"}),

], debug=True)


if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.instance().start()
