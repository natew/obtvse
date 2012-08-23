if (config = Rails.root.join('config', 'config.yml')).exist?
  CONFIG = YAML::load(ERB.new(IO.read(config)).result)
else
  CONFIG = {
    'title' =>    'Obtvse Demo',
    'tagline' =>  'Clever tagline!',
    'login' =>    ENV["obtvse_login"] ? ENV["obtvse_login"] : "username",
    'password' => ENV["obtvse_password"] ? ENV["obtvse_password"] : "password"
  }
end



# ---
# title:               DWS
# tagline:             Developing with Style
# login:               <%= ENV["obtvse_login"] ? ENV["obtvse_login"] : "username" %>
# password:            <%= ENV["obtvse_password"] ? ENV["obtvse_password"] : "password" %>
# name:                Joel Moss
# twitter:             joelmoss
# github:              joelmoss
# email:               joel@developwithstyle.com
# google_analytics_id: YOUR_GA_ID
# disqus_shortname:    <%= ENV.fetch("disqus_shortname") { "joelmoss" } %>
