module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end

  class HTMLwithPygments < Redcarpet::Render::HTML
    def block_code code, language
      Pygments.highlight( code, lexer: language, options: { encoding: 'utf-8' } )
    end
  end

  def markdown(text)
    text = youtube_embed(text)
    text = gist_embed(text)
    my_render = Redcarpet::Markdown.new(HTMLwithPygments, :fenced_code_blocks => true)
    my_render.render text
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
