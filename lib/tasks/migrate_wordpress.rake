# -*- coding:utf-8 -*-
# Usage rake wordpress:migrate_wordpress[:src, :dst]
namespace :wordpress do
    task :migrate_wordpress, [:src, :dst] => :environment do |cmd, args|
      args.with_defaults(:src => "wordpress", :dst => "development")
      config = Rails.configuration.database_configuration
      src_db = config[args[:src]]
      dst_db = config[args[:dst]]

      conn = ActiveRecord::Base.establish_connection src_db
      posts = conn.connection.execute 'SELECT * FROM wp_posts'

      conn = ActiveRecord::Base.establish_connection dst_db
      puts conn
      posts.each do |post|
          title = post[5].force_encoding 'utf-8'
          content = post[4].force_encoding 'utf-8'
          #TODO Test draft functionality
          #TODO Date published
          draft = post[7]  # Could be publish, draft or auto-draft

          if draft.end_with? "draft"
              draft = true
          elsif draft.end_with? "publish"
              draft = false
          end

          p = Post.create! :title => title, :content => content, :slug => Post.acts_as_url(:title, :url_attribute => :slug)
      end
    end
end
