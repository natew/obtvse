module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end
end