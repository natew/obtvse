class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.string :image_file_name, :image_file_size, :image_content_type
      t.timestamp :image_updated_at
    end
  end
end