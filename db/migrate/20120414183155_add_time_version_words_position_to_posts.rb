class AddTimeVersionWordsPositionToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :version, :integer
    add_column :posts, :position, :integer
    add_column :posts, :timespent, :integer
  end
end
