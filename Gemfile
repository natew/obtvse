source 'https://rubygems.org'

gem 'rails', '~> 3'

gem 'jquery-rails', '~> 2'
gem 'rdiscount'
gem 'bcrypt-ruby', '~> 3', require: 'bcrypt'
gem 'stringex', '~> 1', git: 'git://github.com/rsl/stringex.git'
gem 'kaminari', '~> 0.13'
gem 'sorcery'

group :production do
  gem 'pg', '~> 0.13'
end

group :development, :test do
  gem 'sqlite3', '~> 1', platform: [:ruby, :mswin, :mingw]
end

group :assets do
  gem 'sass-rails', '~> 3'
  gem 'coffee-rails', '~> 3'
  gem 'uglifier', '~> 1'
end
