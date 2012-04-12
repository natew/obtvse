require 'redcarpet'

module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end

  def markdown(text)
    #text = youtube_embed(text) TODO: put this inside custom renderer
    render = HTMLwithPygments.new(
              :hard_wrap => true,
              :gh_blockcode => true,
              :filter_html => false,
              :safe_links_only => true
            )

    redcarpet = Redcarpet::Markdown.new(render,
                  :fenced_code_blocks => true,
                  :autolink => true,
                  :no_intra_emphasis => true,
                  :strikethrough => true,
                  :superscripts => true
                )

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

# create a custom renderer that allows highlighting of code blocks
class HTMLwithPygments < Redcarpet::Render::HTML
  def block_code(code, language)
    Pygments.highlight(code,language)
    "<code>#{code}</code>"
  end
end