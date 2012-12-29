require 'redcarpet'

module ApplicationHelper
  def is_admin?
    logged_in?
  end

  def markdown(text)
    text = youtube_embed(text)

    render = HTMLwithPygments.new(
      hard_wrap: true,
      gh_blockcode: true,
      filter_html: false,
      safe_links_only: true
    )

    redcarpet = Redcarpet::Markdown.new(render,
      fenced_code_blocks: true,
      autolink: true,
      no_intra_emphasis: true,
      strikethrough: true,
      superscripts: true,
    )

    redcarpet.render(text)
  end

  def youtube_embed(str)
    output = str.lines.map do |line|
      match = nil
      match = line.match(/^http.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)

      if match
        render partial: 'youtube', locals: { video: match[1] }
      else
        line
      end
    end
    output.join
  end
end

# create a custom renderer that allows highlighting of code blocks

class HTMLwithPygments < Redcarpet::Render::HTML
  # require 'pygments'

  def block_code(code, lang)
    if code
      code.gsub!(/[\<]/, '&lt;')
      code.gsub!(/[\>]/, '&gt;')
      "<code class=\"prettyprint\">#{code}</code>"
    end
  end
end