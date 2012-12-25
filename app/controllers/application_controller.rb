class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :get_user

  helper_method :no_users?

  def no_users?
    User.all.count == 0
  end

  private

  def get_user
    @user = current_user || User.new
  end
end
