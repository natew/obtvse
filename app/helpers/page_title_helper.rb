module PageTitleHelper
  def html_title(content)
    if content.present?
      [content,CONFIG['title']].join(' - ')
    else
      CONFIG['title']
    end
  end

  def page_title(content)
    @title = content || CONFIG['title']
    render partial: 'title'
  end

  def linked_title
    link_to CONFIG['title'], root_path
  end
end
