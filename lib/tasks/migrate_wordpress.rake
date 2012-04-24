# -*- coding:utf-8 -*-
# Usage rake wordpress:migrate_wordpress[:src, :dst]
# You will need gem "mysql" in your Gemfile

namespace :wordpress do
    task :migrate_wordpress, [:src, :dst] => :environment do |cmd, args|
        args.with_defaults(:src => "wordpress", :dst => "development")
        config = Rails.configuration.database_configuration
        src_db = config[args[:src]]
        dst_db = config[args[:dst]]

        conn = ActiveRecord::Base.establish_connection src_db
        posts = conn.connection.execute "SELECT * FROM wp_posts where post_status='draft' or post_status='publish'"

        conn = ActiveRecord::Base.establish_connection dst_db

        posts.each do |post|
            title = post[5].force_encoding 'utf-8'
            content = post[4].force_encoding 'utf-8'
            created_at = post[2]
            updated_at = post[14]
            draft = post[7]

            if draft.end_with? "draft"
                draft_flag = true
            elsif draft.end_with? "publish"
                draft_flag = false
            end

            p = Post.create! :title => title, :content => content, :slug => Post.acts_as_url(:title, :url_attribute => :slug),
                             :created_at => created_at, :updated_at => updated_at, :draft => draft_flag
        end
    end
end
