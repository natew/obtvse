module ApplicationHelper
  def is_admin?
    true if session[:admin] == true
  end

  def markdown(text)
    output = text.lines.map do |line|
      process_line line
    end.join
    RedcarpetCompat.new(output, :fenced_code, :gh_blockcode)
  end

  def process_line(line)
    match = match_gist line
    return "<div id=\"#{match[1]}\" class=\"gist-files\">Loading gist...</div>" if match

    match = match_youtube line
    return render(:partial => 'youtube', :locals => { :video => match[1] }) if match

    line
  end

  def match_gist(line)
    line.match(/\{\{gist\s+(.*)\}\}/)
  end

  def match_youtube(line)
    line.match(/^http.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)
  end

end