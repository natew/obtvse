class SetPostDefaultToDraft < ActiveRecord::Migration
  def change
    change_column_default :posts, :draft, true
  end
end
