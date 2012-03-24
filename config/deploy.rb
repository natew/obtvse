require "bundler/capistrano"
load 'deploy/assets'

default_run_options[:pty] = true

set :user, "nwienert"
set :application, "natewienert"
set :domain, "199.36.105.18"
set :repository,  "ssh://nwienert@199.36.105.18/var/git/#{application}.git"
set :deploy_to, "/var/www/#{application}.com/web"
set :scm, :git
set :branch, '1.1'
set :scm_verbose, true
set :rails_env, "production"
set :keep_releases, 2

role :web, domain
role :app, domain
role :db,  domain, :primary => true # This is where Rails migrations will run

after 'deploy:update', 'deploy:cleanup'
after 'deploy:update', 'deploy:symlink'

namespace :deploy do
  task :start, :roles => :app do
    run "touch #{current_release}/tmp/restart.txt"
  end

  task :stop, :roles => :app do
  end

  desc "Restart Application"
  task :restart, :roles => :app do
    run "touch #{current_release}/tmp/restart.txt"
  end

  task :symlink_attachments do
    run "ln -ls #{shared_path}/config.yml #{release_path}/config/config.yml"
  end
end