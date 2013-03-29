source 'https://rubygems.org'

gem 'rails', '~> 3'
gem 'jquery-rails', '~> 2'

gem 'thin'

# Auth/users
gem 'sorcery'
gem 'bcrypt-ruby', "~> 3.0.0"

# Frontend Utilities
gem 'slim'
gem 'turbolinks'
gem 'bourbon', '~> 2.0.0.rc1'

gem 'redcarpet', require: false
gem 'kaminari'

# Ruby Utilities
gem 'stringex', '~> 1', github: 'rsl/stringex'
gem 'chronic'

group :production do
  gem 'pg', '~> 0.13'
  gem 'aws-sdk', '~> 1.3.4'
end

group :development, :test do
  gem 'sqlite3', '~> 1', platform: [:ruby, :mswin, :mingw]
  gem 'capistrano'
  gem 'capistrano_colors'
  gem 'quiet_assets'
  gem 'foreman'
end

group :assets do
  gem 'sass-rails', '~> 3'
  gem 'coffee-rails', '~> 3'
  gem 'uglifier', '~> 1'
end
