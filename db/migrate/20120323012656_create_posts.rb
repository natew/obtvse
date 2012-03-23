class CreatePosts < ActiveRecord::Migration
  def change
    create_table :posts do |t|
      t.string :title, :slug
      t.text :content
      t.boolean :draft
      t.timestamps
    end
  end
end
