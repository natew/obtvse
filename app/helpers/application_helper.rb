require 'redcarpet'

module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end

  def markdown(text)
    text = youtube_embed(text)
    redcarpet = Redcarpet::Markdown.new(HTMLwithPygments, :fenced_code_blocks => true)
    redcarpet.render(text)
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