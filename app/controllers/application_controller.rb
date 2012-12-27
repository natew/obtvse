class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :get_user
  helper_method :no_users?

  rescue_from ActiveRecord::RecordNotFound, :with => :render_not_found

  unless Rails.configuration.consider_all_requests_local
    rescue_from Exception, :with => :render_error
    rescue_from ActionController::RoutingError, :with => :render_not_found
    rescue_from ActionController::UnknownController, :with => :render_not_found
    rescue_from ActionController::UnknownAction, :with => :render_not_found
  end

  def no_users?
    User.all.count == 0
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end

  def render_not_found(exception)
    logger.error "404 Not Found"
    logger.error exception
    render template: 'errors/404', status: 404 unless @not_found
  end

  def render_error(exception)
    logger.error "500 Internal Server Error"
    logger.error exception
    render template: 'errors/500', status: 500 unless @not_found
  end

  private

  def get_user
    @user = current_user || User.new
  end
end
