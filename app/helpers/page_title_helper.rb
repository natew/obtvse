module PageTitleHelper
  def html_title(content)
    if content.present?
      [content,CONFIG['name']].join(' - ')
    else
      CONFIG['name']
    end
  end

  def page_title(content)
    @title = content || CONFIG['name']
    render partial: 'name'
  end

  def linked_title
    link_to CONFIG['name'], root_path
  end
end
