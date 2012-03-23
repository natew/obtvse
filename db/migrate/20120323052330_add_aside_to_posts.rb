class AddAsideToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :aside, :boolean, :default => false
  end
end
