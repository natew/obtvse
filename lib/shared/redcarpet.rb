require 'language_sniffer'

# create a custom renderer that allows highlighting of code blocks
class HTMLwithPygments < Redcarpet::Render::HTML
  def block_code(code, language)
    begin
      language = LanguageSniffer.detect('test/test', :content => code).language.name || 'text'
      pygmented_code = Pygments.highlight(code, :lexer => language.downcase)
      "<code>#{pygmented_code}</code>"
    rescue Exception => e
      puts e.message
      puts e.backtrace.join("\n")
      "<code>#{code}</code>"
    end
  end
end