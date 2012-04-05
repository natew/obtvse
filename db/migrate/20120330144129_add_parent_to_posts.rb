class AddParentToPosts < ActiveRecord::Migration
  def change
  	add_column :posts, :parent, :integer
  end
end
