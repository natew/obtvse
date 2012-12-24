module AttachmentHelper
  class << self
    def included(base)
      base.extend ClassMethods
    end
  end

  module ClassMethods
    def has_attachment(name, options = {})
      # generates a string containing the singular model name and the pluralized attachment name.
      # Examples: "user_avatars" or "asset_uploads" or "message_previews"
      attachment_owner    = self.table_name.singularize
      attachment_folder   = "#{attachment_owner}_#{name.to_s.pluralize}"

      # we want to create a path for the upload that looks like:
      # message_previews/00/11/22/001122deadbeef/thumbnail.png
      attachment_path     = "#{attachment_folder}/:id_:style.:extension"

      # Use s3 only in production unless specified in config
      if INFO['s3_in_development'] or Rails.env.production?
        options[:path]            ||= attachment_path
        options[:storage]         ||= :s3
        options[:s3_credentials]  ||= { :access_key_id => INFO['access_key_id'], :secret_access_key => INFO['secret_access_key'] }
        options[:bucket]          ||= INFO['bucket_name']
        options[:s3_permissions]  ||= 'private'
      else
        # For local Dev/Test envs, use the default filesystem, but separate the environments
        # into different folders, so you can delete test files without breaking dev files.
        options[:path]        ||= ":rails_root/public/attachments/#{Rails.env}/#{attachment_path}"
        options[:url]         ||= "/attachments/#{Rails.env}/#{attachment_path}"
      end

      options[:default_url] ||= '/images/default_:style.jpg'

      # pass things off to paperclip.
      has_attached_file name, options
    end
  end
end