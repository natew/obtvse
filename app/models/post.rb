class Post < ActiveRecord::Base
  validates :slug, presence: true, uniqueness: true
  acts_as_url :title, :url_attribute => :slug

  scope :published, where(draft: false)
  scope :newest, order('created_at desc')

  def to_param
    slug
  end

  def external?
    !url.blank?
  end
end
