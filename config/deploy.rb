require "bundler/capistrano"
load 'deploy/assets'

default_run_options[:pty] = true

set :user, "nwienert"
set :application, "natewienert"
set :domain, "199.36.105.18"
set :repository,  "ssh://nwienert@199.36.105.18/var/git/#{application}.git"
set :deploy_to, "/var/www/#{application}.com/web"
set :scm, :git
set :branch, 'live'
set :scm_verbose, true
set :rails_env, "production"
set :keep_releases, 2

role :web, domain
role :app, domain
role :db,  domain, :primary => true # This is where Rails migrations will run

after 'deploy:update', 'deploy:cleanup'
after 'deploy:update', 'deploy:create_symlink'

# Runs +command+ as root invoking the command with su -c
# and handling the root password prompt.
def surun(command)
  run("su - -c '#{command}'") do |channel, stream, output|
    channel.send_data("#{password}\n") if output
  end
end

namespace :deploy do
  task :start, :roles => :app do
    surun "cd #{current_path};RAILS_ENV=production bundle exec thin start -C config/thin.yml"
  end

  task :stop, :roles => :app do
    surun "cd #{current_path};RAILS_ENV=production bundle exec thin stop -C config/thin.yml"
  end

  task :restart, :roles => :app do
    surun "cd #{current_path};RAILS_ENV=production bundle exec thin restart -C config/thin.yml"
  end

  task :symlink_attachments do
    run "ln -ls #{shared_path}/config.yml #{release_path}/config/config.yml"
  end
end