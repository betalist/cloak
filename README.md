CLOAK
=====
Anonymous IP allocation through Heroku Worker Dynos.

This is a fork of [@thnkr/cloak][thnkr-cloak], and provides support for:

- in-house proxy renewal (please, read below)
- several other commands, such as:
  - `/ip`: lists the current IP address for the heroku dyno
  - `/refresh-after`: proxy can be renewed after this time
  - etc.
- dropped dependency on RouteDirector
- dropped support for `/cluster`

**WORK IN PROGRESS**

### In-house Proxy Renewal

Heroku automatically restarts a worker dyno, if it crashes. However, Heroku only
does that every 10 minutes, i.e. if the app crashes twice within 10 minutes,
Heroku will go in a cooldown period.

The modified version for proxy renewal utilizes the above fact and crashes the
app deliberately. However, due to the limitation stated above, proxy cannot be
refreshed for the next 10 minutes. If need be, we can always deploy more app
instances to overcome this limitation.

## Continued from the Original Repo (with slight modifications)..

### BACKGROUND "Cloak" is call based API which means that it is controlled by
requesting variations of a URL. It is broken into two running processes,
a managing script on an AWS instance, and a series of pre-configured heroku
Dynos which each have a built in scraping module. Each dyno requests a dynamic
IP address and performs the data call for you. It supports http and https,
Javascript, Jquery, AJAX and anything else with a GET request. If this is
something you end up using I will add in the POST functionality for when you
might need to login.  

The scripts are included as a proof of concept around the app currently hosted
at: http://cloak.herokuapp.com. Cloak is written in Node 0.10.8 but all features
are supported across all major languages (Sorry, lisp and fortran are off the
table). 

Heroku (www.heroku.com) is a platform that offers VM and hosting services for
applications. Often touted as a weakness of Heroku, the platform rotates the IP
address of each app deployment. On the other hand, the dynamic assignments are
incredibly valuable if each dyno were to act as a proxy for requests from
a local machine.

### USE CASE

For services where a "fresh" IP address is needed, Cloak allows you to access
data anonymously from a new and anonymous IP without the need for proxy services
or "spoofing". 

To use Cloak, you append every url call to the Cloak address. 

1. http://cloak.herokuapp.com/?http://www.whatismyip.com the response is then
returned as a complete browser object. 

2. Cloak supports https secure connections automatically. Simply ensure the
   calls you want are the complete https url and Cloak will adapt. 

Now your script has it’s own unique URL assigned to outgoing requests. 

What to do with throttling/blocked IPs/blacklisting? Simply include a latency
timer and an if statement in your script. If the latency gets too long, load
http://cloak.herokuapp.com/refresh and wait for 15 seconds for the dynos to boot
down and reconnect with Heroku and Route Director. 

For example, this script (http://github.com/nikhgupta/cloak/examples/basic.py)
demos controlling the cloak and scrapes whatismyip.com as an example so you can
see the change.

    import time
    import codecs
    import re
    import urllib2
    import pprint
    from bs4 import BeautifulSoup, SoupStrainer
    import string
    import sys
    freshIP = http://cloak.herokuapp.com/refresh

    target_url = 'http://www.whatismyip.com/'
    header =  {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11','Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3','Accept-Encoding': 'none','Accept-Language':     'en-US,en;q=0.8','Connection': 'keep-alive'}
    open_url = urllib2.Request(target_url, headers=header)
    target_data = urllib2.urlopen(open_url)
    soup = BeautifulSoup(target_data)
    links = soup.findAll('div',{'id':'greenip'})[0].getText()
    print ' ' 
    print target_url
    print 'Publicly...'
    print links

    target_url = 'http://cloak.herokuapp.com/?http://www.whatismyip.com/'
    header =  {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11','Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3','Accept-Encoding': 'none','Accept-Language': 'en-US,en;q=0.8','Connection': 'keep-alive'}
    open_url = urllib2.Request(target_url, headers=header)
    target_data = urllib2.urlopen(open_url)
    soup = BeautifulSoup(target_data)
    links = soup.findAll('div',{'id':'greenip'})[0].getText()
    print 'http://wwww.whatismyip.com/'
    print 'In a cloak...'
    print links
    time.sleep(2) # "Paw"se for effect. 

    print 'Now lets change cloaks...\nCALLED URL: cloak.herokuapp.com/refresh\nWAITING 15 Seconds'
    open_url = urllib2.Request(freshIP, headers=header) # Note the freshIP variable. 
    target_data = urllib2.urlopen(open_url)
    soup = BeautifulSoup(target_data)
    time.sleep(15)

    print '\nUse New IP:'
    target_url = 'http://cloak.herokuapp.com/?http://www.whatismyip.com/'
    header =  {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11','Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Charset':   'ISO-8859-1,utf-8;q=0.7,*;q=0.3','Accept-Encoding': 'none','Accept-Language':'en-US,en;q=0.8','Connection': 'keep-alive'}
    open_url = urllib2.Request(target_url, headers=header)
    target_data = urllib2.urlopen(open_url)
    soup = BeautifulSoup(target_data)
    links = soup.findAll('div',{'id':'greenip'})[0].getText()
    print 'http://wwww.whatismyip.com/'
    print 'Our fresh IP:'
    print links

The output of the example script looks like this:

    http://www.whatismyip.com/
    Publicly...
    54.225.220.147
    
    http://wwww.whatismyip.com/
    In a cloak...
    184.72.209.15
    
    Now lets change cloaks...
    CALLED URL: cloak.herokuapp.com/refresh
    WAITING 15 Seconds

    Our fresh IP:
    http://wwww.whatismyip.com/
    In a new cloak...
    54.224.225.80



### INSTALLATION
* Create a free Heroku account at www.Heroku.com.
* Install the Heroku Toolbelt (https://toolbelt.heroku.com/)
* Download the repo and install the necessary packages.

	    git clone git://github.com/nikhgupta/cloak.git
	    cd cloak/app
	    git init
	    npm install
 	    heroku create
	    git add .
	    git commit -m "Some commit message."
	    git push heroku master

* Navigate to your hostaddress on port 3000. If this is on AWS make sure you
  have opened the security group on the port. 

* ERRORS

Were you unable to authenticate? Follow these steps:
https://devcenter.heroku.com/articles/keys

Make sure you change the Child_Process directory to match your Heroku app. This
can be found in cloak/front-end/front-end.js.

Cloak is written in Node JS and spawns a Child Process to interact with Heroku.
Read more about these here: http://nodejs.org/api/child_process.html.

### LINKS

* https://github.com/icodeforlove/node-requester
* https://devcenter.heroku.com/articles/third-party-buildpacks

  [thnkr-cloak]: https://github.com/thnkr/cloak
