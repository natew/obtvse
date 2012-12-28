class Post < ActiveRecord::Base

  validates :slug, presence: true, uniqueness: true
  validates :title, presence: true

  acts_as_url :title, :url_attribute => :slug

  scope :published, where(draft: false)
  scope :newest, order('created_at desc')

  before_save :update_published_at, :chronic_parse_date

  def to_param
    slug
  end

  def external?
    !url.blank?
  end

  def published_at
    read_attribute(:published_at) ? read_attribute(:published_at).to_formatted_s(:long) : ''
  end

  private

  def chronic_parse_date
    if published_at and self.published_at_changed?
      self.published_at = Chronic.parse(published_at)
    end
  end

  def update_published_at
    if published_at.nil? and self.draft_changed? and self.draft_was == true
      self.published_at = Time.now
    end
  end
end
