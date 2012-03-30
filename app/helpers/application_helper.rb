module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end

  def markdown(text)
    text = youtube_embed(text)
    r = RDiscount.new(text)
    r.smart = true
    r
  end

  def youtube_embed(str)
  	output = str.lines.map do |line|
  		match = nil
  		match = line.match(/^http.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)
  		match ? render(:partial => 'youtube', :locals => { :video => match[1] }) : line
  	end
  	output.join
  end
end