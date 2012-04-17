class AddTitleToRevision < ActiveRecord::Migration
  def change
    add_column :revisions, :title, :string
    remove_column :posts, :version
    remove_column :posts, :position
  end
end
