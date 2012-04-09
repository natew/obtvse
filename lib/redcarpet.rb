require 'rubygems'
require 'sourceclassifier'

# create a custom renderer that allows highlighting of code blocks
class HTMLwithPygments < Redcarpet::Render::HTML
  def block_code(code, language)
    begin
      s = SourceClassifier.new
      i = s.identify(code) || 'javascript'
      p = Pygments.highlight(code, :lexer => i.downcase)
      "<code>#{p}</code>"
    rescue Exception => e
      puts e.message
      puts e.backtrace.inspect
      "<code>#{code}</code>"
    end
  end
end