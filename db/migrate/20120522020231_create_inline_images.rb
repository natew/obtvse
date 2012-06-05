class CreateInlineImages < ActiveRecord::Migration
  def change
    create_table :inline_images do |t|

      t.timestamps
    end
  end
end
