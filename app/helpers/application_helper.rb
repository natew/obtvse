module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end

  def markdown(text)
    text = youtube_embed(text)
    text = gist_embed(text)
    RedcarpetCompat.new(text, :fenced_code, :gh_blockcode)
  end

  # TODO refactor these filters so they don't each iterate over all the lines
  def gist_embed(str)
    output = str.lines.map do |line|
      match = nil
      match = line.match(/\{\{gist\s+(.*)\}\}/)
      match ? "<div id=\"#{match[1]}\" class=\"gist\">Loading gist...</div>" : line
    end
    output.join
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