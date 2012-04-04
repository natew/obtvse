source 'https://rubygems.org'

gem 'rails', '3.1.3'

# Extention libraries
gem 'thin'

# Rendering engines and vendor libraries
gem 'jquery-rails'
gem 'rdiscount'
gem 'haml'
gem 'haml-rails'

# Misc libraries
# gem 'bcrypt-ruby'
gem 'stringex'
gem 'kaminari'
gem 'therubyracer'
group :production do
  # gem 'newrelic_rpm'
  # gem 'dalli'
  gem 'pg'
end

group :development do
  # gem 'heroku', '~> 2'
  # gem 'capistrano', '~> 2.9'
  # gem 'guard', '~> 1'
  # gem 'guard-rspec', '~> 0.6'
  # gem 'guard-spork', '~> 0.5'
  gem 'rails_best_practices', '~> 1'
end

group :test do
  gem 'capybara', '~> 1'
  gem 'spork', '~> 0.9'
  gem 'database_cleaner', '~> 0.7'
end

group :development, :test do
  gem 'foreman', '~> 0.40'
  gem 'sqlite3', '~> 1', platform: [:ruby, :mswin, :mingw]
  gem 'faker', '~> 1'
  gem 'factory_girl_rails', '~> 1'
end

group :assets do
  gem 'sass-rails', '~> 3'
  gem 'coffee-rails', '~> 3'
  gem 'uglifier', '~> 1'
end
