class User < ActiveRecord::Base
  authenticates_with_sorcery!

  attr_accessible :email, :password, :password_confirmation

  validates_confirmation_of :password
  validates_presence_of :password, on: :create
  validates_uniqueness_of :email

  before_create :set_username_to_email_name

  private

  def set_username_to_email_name
    self.username = email.gsub(/[@].*/, '')
  end
end
