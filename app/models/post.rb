class Post < ActiveRecord::Base
  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true
  acts_as_url :title, :url_attribute => :slug

  default_scope order('created_at desc')

  def to_param
    slug
  end

  def external?
  	!url.blank?
  end
end
