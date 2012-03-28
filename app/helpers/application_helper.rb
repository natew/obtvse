module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end
  
  def markdown(text)
    r = RDiscount.new(text)
    r.smart = true
    r
  end
end