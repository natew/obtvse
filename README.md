Obtvse
================
A clean and simple markdown blog.  Inspired by [Svbtle](http://svbtle.com).

**[Demo](http://obtvse.herokuapp.com) | [Demo Admin](http://obtvse.herokuapp.com/admin)**

Username: username

Password: password



Installation
============

If you are new to Rails development, check out guides for getting your development environment set up for [Mac](http://astonj.com/tech/setting-up-a-ruby-dev-enviroment-on-lion/) and [Windows](http://jelaniharris.com/2011/installing-ruby-on-rails-3-in-windows/).

    git clone git://github.com/NateW/obtvse.git
    cd obtvse
    bundle install
    rake db:migrate

Edit `config/config.yml`.  Be sure to set your own admin username and password.


Start the local server:

    rails s

Go to [0.0.0.0:3000](http://0.0.0.0:3000/), to administrate you go to [/admin](http://0.0.0.0:3000/admin)



TODO
====
- Easy deployment
- Draft preview and post save history
- Lots of refactoring, cleanup and refinements



SCREENSHOTS
===========
![Admin](http://i.imgur.com/OVr7q.png)
![New](http://i.imgur.com/MTm2c.png)
![Edit](http://i.imgur.com/VSR7M.png)
