class ApplicationController < ActionController::Base
  protect_from_forgery

  private

  def authenticate
    authenticate_or_request_with_http_basic do |login, password|
      if login == CONFIG['login'] and password == CONFIG['password']
      	session[:admin] = true
      	true
      end
    end
  end
end
