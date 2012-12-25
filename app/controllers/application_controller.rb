class ApplicationController < ActionController::Base
  protect_from_forgery

  private

  def authenticate
    authenticate_or_request_with_http_basic do |login, password|
      if login == ENV['obtvse_login'] and password == ENV['obtvse_password']
        session[:admin] = true
      end
    end
  end
end
