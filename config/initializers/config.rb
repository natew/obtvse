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